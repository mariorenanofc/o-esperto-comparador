/* Structured logging system for production monitoring */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  page?: string;
  userAgent?: string;
  stack?: string;
}

class Logger {
  private sessionId: string;
  private userId?: string;
  private isProduction: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string | null) {
    this.userId = userId || undefined;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId: this.userId,
      sessionId: this.sessionId,
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      stack: error?.stack,
    };
  }

  private async sendToRemote(entry: LogEntry) {
    // In production, send to analytics/monitoring service
    if (this.isProduction && (entry.level === 'error' || entry.level === 'critical')) {
      try {
        const { analytics } = await import('@/lib/analytics');
        await analytics.trackError(new Error(entry.message), {
          level: entry.level,
          context: entry.context,
          sessionId: entry.sessionId,
          userId: entry.userId,
        });
      } catch (err) {
        console.error('Failed to send log to remote:', err);
      }
    }
  }

  debug(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry('debug', message, context);
    
    if (!this.isProduction) {
      console.log(`🐛 [DEBUG] ${entry.message}`, entry.context || '');
    }
  }

  info(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry('info', message, context);
    
    console.info(`ℹ️ [INFO] ${entry.message}`, entry.context || '');
    this.sendToRemote(entry);
  }

  warn(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry('warn', message, context);
    
    console.warn(`⚠️ [WARN] ${entry.message}`, entry.context || '');
    this.sendToRemote(entry);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    const entry = this.createLogEntry('error', message, context, error);
    
    console.error(`🚨 [ERROR] ${entry.message}`, {
      error: error?.message,
      stack: error?.stack,
      context: entry.context,
    });
    
    this.sendToRemote(entry);
  }

  critical(message: string, error?: Error, context?: Record<string, any>) {
    const entry = this.createLogEntry('critical', message, context, error);
    
    console.error(`💥 [CRITICAL] ${entry.message}`, {
      error: error?.message,
      stack: error?.stack,
      context: entry.context,
    });
    
    this.sendToRemote(entry);
    
    // For critical errors, also try to persist locally
    if (typeof window !== 'undefined') {
      try {
        const criticalLogs = JSON.parse(localStorage.getItem('critical_logs') || '[]');
        criticalLogs.push(entry);
        localStorage.setItem('critical_logs', JSON.stringify(criticalLogs.slice(-10))); // Keep last 10
      } catch (err) {
        console.error('Failed to persist critical log:', err);
      }
    }
  }

  // Performance logging
  performance(action: string, duration: number, context?: Record<string, any>) {
    const entry = this.createLogEntry('info', `Performance: ${action}`, {
      duration,
      ...context,
      performance: true,
    });
    
    if (duration > 1000) { // Log slow operations
      console.warn(`⏱️ [PERF] Slow ${action}: ${duration}ms`, context);
    } else if (!this.isProduction) {
      console.log(`⏱️ [PERF] ${action}: ${duration}ms`, context);
    }
    
    this.sendToRemote(entry);
  }

  // User action logging
  userAction(action: string, context?: Record<string, any>) {
    const entry = this.createLogEntry('info', `User Action: ${action}`, {
      ...context,
      userAction: true,
    });
    
    if (!this.isProduction) {
      console.log(`👤 [USER] ${action}`, context);
    }
    
    this.sendToRemote(entry);
  }

  // API call logging
  apiCall(method: string, url: string, duration: number, status: number, context?: Record<string, any>) {
    const entry = this.createLogEntry('info', `API Call: ${method} ${url}`, {
      method,
      url,
      duration,
      status,
      ...context,
      apiCall: true,
    });
    
    const logLevel = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    const emoji = status >= 400 ? '🚨' : status >= 300 ? '⚠️' : '📡';
    
    if (logLevel === 'error' || !this.isProduction) {
      console[logLevel](`${emoji} [API] ${method} ${url} - ${status} (${duration}ms)`, context);
    }
    
    this.sendToRemote(entry);
  }
}

// Global logger instance
export const logger = new Logger();

// Performance measurement helper
export const measurePerformance = async <T>(
  name: string,
  fn: () => Promise<T> | T,
  context?: Record<string, any>
): Promise<T> => {
  const start = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logger.performance(name, duration, context);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`Performance measurement failed: ${name}`, error as Error, {
      duration,
      ...context,
    });
    throw error;
  }
};

// Initialize user ID when auth changes
if (typeof window !== 'undefined') {
  // Listen for auth changes and update logger
  import('@/integrations/supabase/client').then(({ supabase }) => {
    supabase.auth.onAuthStateChange((event, session) => {
      logger.setUserId(session?.user?.id || null);
      logger.info(`Auth state changed: ${event}`, {
        userId: session?.user?.id,
        event,
      });
    });
  });
}