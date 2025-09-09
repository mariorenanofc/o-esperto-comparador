import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsEvent {
  event_type: string;
  event_name: string;
  properties?: Record<string, any>;
  session_id?: string;
  page_url?: string;
  user_agent?: string;
}

export interface PerformanceMetrics {
  endpoint: string;
  method: string;
  response_time_ms: number;
  status_code: number;
  error_message?: string;
  request_size_bytes?: number;
  response_size_bytes?: number;
}

export class AnalyticsService {
  private sessionId: string;
  private userId: string | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeUser();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initializeUser() {
    const { data: { user } } = await supabase.auth.getUser();
    this.userId = user?.id || null;
  }

  async track(event: AnalyticsEvent): Promise<void> {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: this.userId,
          event_type: event.event_type,
          event_name: event.event_name,
          properties: event.properties || {},
          session_id: event.session_id || this.sessionId,
          page_url: event.page_url || window.location.href,
          user_agent: event.user_agent || navigator.userAgent,
          ip_address: null // This will be handled server-side if needed
        });

      if (error) {
        console.error('Analytics tracking error:', error);
      }
    } catch (error) {
      console.error('Analytics service error:', error);
    }
  }

  async trackPageView(page: string, properties?: Record<string, any>): Promise<void> {
    await this.track({
      event_type: 'page_view',
      event_name: 'page_viewed',
      properties: {
        page,
        ...properties
      }
    });
  }

  async trackUserAction(action: string, properties?: Record<string, any>): Promise<void> {
    await this.track({
      event_type: 'user_action',
      event_name: action,
      properties
    });
  }

  async trackComparison(properties: Record<string, any>): Promise<void> {
    await this.track({
      event_type: 'feature_usage',
      event_name: 'comparison_created',
      properties
    });
  }

  async trackContribution(properties: Record<string, any>): Promise<void> {
    await this.track({
      event_type: 'feature_usage',
      event_name: 'price_contributed',
      properties
    });
  }

  async trackError(error: Error, context?: Record<string, any>): Promise<void> {
    await this.track({
      event_type: 'error',
      event_name: 'application_error',
      properties: {
        error_message: error.message,
        error_stack: error.stack,
        ...context
      }
    });
  }

  async trackPerformance(metrics: PerformanceMetrics): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_performance_logs')
        .insert({
          endpoint: metrics.endpoint,
          method: metrics.method,
          response_time_ms: metrics.response_time_ms,
          status_code: metrics.status_code,
          user_id: this.userId,
          error_message: metrics.error_message,
          request_size_bytes: metrics.request_size_bytes,
          response_size_bytes: metrics.response_size_bytes
        });

      if (error) {
        console.error('Performance tracking error:', error);
      }
    } catch (error) {
      console.error('Performance service error:', error);
    }
  }

  // Web Vitals tracking
  async trackWebVitals(metric: any): Promise<void> {
    await this.track({
      event_type: 'performance',
      event_name: 'web_vital',
      properties: {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating,
        metric_id: metric.id
      }
    });
  }

  updateUserId(userId: string | null) {
    this.userId = userId;
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

// Global analytics instance
export const analytics = new AnalyticsService();

// Update user ID when auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  analytics.updateUserId(session?.user?.id || null);
});