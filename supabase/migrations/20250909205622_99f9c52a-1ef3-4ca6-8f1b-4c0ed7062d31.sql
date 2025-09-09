-- Create analytics_events table for tracking user interactions
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  session_id TEXT,
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create api_performance_logs table for API monitoring
CREATE TABLE public.api_performance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  response_time_ms INTEGER NOT NULL,
  status_code INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  error_message TEXT,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_dashboard_widgets table for custom dashboards
CREATE TABLE public.user_dashboard_widgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  widget_type TEXT NOT NULL,
  widget_config JSONB NOT NULL DEFAULT '{}',
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 1,
  height INTEGER NOT NULL DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics_alerts table for automated alerts
CREATE TABLE public.analytics_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  alert_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  threshold_value NUMERIC NOT NULL,
  comparison_operator TEXT NOT NULL DEFAULT 'greater_than',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered TIMESTAMP WITH TIME ZONE,
  notification_channels JSONB DEFAULT '["email"]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_templates table for notification templates
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_events
CREATE POLICY "Users can insert their own analytics events" 
ON public.analytics_events FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all analytics events" 
ON public.analytics_events FOR SELECT 
USING (is_user_admin());

CREATE POLICY "Users can view their own analytics events" 
ON public.analytics_events FOR SELECT 
USING (auth.uid() = user_id);

-- RLS Policies for api_performance_logs
CREATE POLICY "Service role can manage API performance logs" 
ON public.api_performance_logs FOR ALL 
USING (CURRENT_USER = 'service_role');

CREATE POLICY "Admins can view all API performance logs" 
ON public.api_performance_logs FOR SELECT 
USING (is_user_admin());

-- RLS Policies for user_dashboard_widgets
CREATE POLICY "Users can manage their own dashboard widgets" 
ON public.user_dashboard_widgets FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all dashboard widgets" 
ON public.user_dashboard_widgets FOR SELECT 
USING (is_user_admin());

-- RLS Policies for analytics_alerts
CREATE POLICY "Users can manage their own analytics alerts" 
ON public.analytics_alerts FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics alerts" 
ON public.analytics_alerts FOR SELECT 
USING (is_user_admin());

-- RLS Policies for email_templates
CREATE POLICY "Admins can manage email templates" 
ON public.email_templates FOR ALL 
USING (is_user_admin()) 
WITH CHECK (is_user_admin());

-- Create indexes for better performance
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);

CREATE INDEX idx_api_performance_logs_endpoint ON public.api_performance_logs(endpoint);
CREATE INDEX idx_api_performance_logs_created_at ON public.api_performance_logs(created_at);
CREATE INDEX idx_api_performance_logs_status_code ON public.api_performance_logs(status_code);

CREATE INDEX idx_user_dashboard_widgets_user_id ON public.user_dashboard_widgets(user_id);
CREATE INDEX idx_analytics_alerts_user_id ON public.analytics_alerts(user_id);
CREATE INDEX idx_email_templates_created_by ON public.email_templates(created_by);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_user_dashboard_widgets_updated_at
  BEFORE UPDATE ON public.user_dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_analytics_alerts_updated_at
  BEFORE UPDATE ON public.analytics_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();