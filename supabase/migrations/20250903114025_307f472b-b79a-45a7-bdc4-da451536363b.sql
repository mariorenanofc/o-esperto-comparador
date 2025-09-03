-- Add location fields to notification_settings table
ALTER TABLE public.notification_settings 
ADD COLUMN location_city TEXT,
ADD COLUMN location_state TEXT,
ADD COLUMN quiet_hours_enabled BOOLEAN DEFAULT true,
ADD COLUMN quiet_hours_start TIME DEFAULT '22:00:00',
ADD COLUMN quiet_hours_end TIME DEFAULT '08:00:00',
ADD COLUMN offers_enabled BOOLEAN DEFAULT true,
ADD COLUMN subscription_reminders_enabled BOOLEAN DEFAULT true;

-- Add location and marketing fields to push_subscriptions table  
ALTER TABLE public.push_subscriptions
ADD COLUMN location_city TEXT,
ADD COLUMN location_state TEXT,
ADD COLUMN marketing_enabled BOOLEAN DEFAULT true;

-- Create notification_send_log table for rate limiting and tracking
CREATE TABLE public.notification_send_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'push',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notification_send_log
ALTER TABLE public.notification_send_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_send_log
CREATE POLICY "Users can view their own notification logs"
ON public.notification_send_log
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notification logs"
ON public.notification_send_log
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all notification logs"
ON public.notification_send_log
FOR SELECT
USING (is_user_admin());

-- Create index for performance on notification logs
CREATE INDEX idx_notification_send_log_user_type_date 
ON public.notification_send_log (user_id, notification_type, sent_at DESC);