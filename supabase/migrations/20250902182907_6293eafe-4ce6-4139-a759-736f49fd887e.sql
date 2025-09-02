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

-- Create function to check if user can receive notification
CREATE OR REPLACE FUNCTION public.can_send_notification(
  target_user_id UUID,
  notification_type TEXT,
  channel_type TEXT DEFAULT 'push'
) RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_plan TEXT;
  quiet_hours_enabled BOOLEAN;
  quiet_start TIME;
  quiet_end TIME;
  current_time TIME;
  daily_count INTEGER;
  user_location_city TEXT;
  user_location_state TEXT;
BEGIN
  -- Get user plan and settings
  SELECT p.plan, ns.quiet_hours_enabled, ns.quiet_hours_start, ns.quiet_hours_end,
         ns.location_city, ns.location_state
  INTO user_plan, quiet_hours_enabled, quiet_start, quiet_end, 
       user_location_city, user_location_state
  FROM public.profiles p
  LEFT JOIN public.notification_settings ns ON ns.user_id = p.id
  WHERE p.id = target_user_id;
  
  -- Default to free plan if not found
  IF user_plan IS NULL THEN
    user_plan := 'free';
  END IF;
  
  -- Check quiet hours for premium/pro users
  IF user_plan IN ('premium', 'pro') AND quiet_hours_enabled THEN
    current_time := CURRENT_TIME;
    
    -- Handle quiet hours that cross midnight
    IF quiet_start > quiet_end THEN
      -- Quiet hours cross midnight (e.g., 22:00 to 08:00)
      IF current_time >= quiet_start OR current_time <= quiet_end THEN
        RETURN FALSE;
      END IF;
    ELSE
      -- Normal quiet hours (e.g., 01:00 to 05:00)
      IF current_time >= quiet_start AND current_time <= quiet_end THEN
        RETURN FALSE;
      END IF;
    END IF;
  END IF;
  
  -- Check daily limits for free users
  IF user_plan = 'free' AND notification_type = 'marketing_offer' THEN
    -- Count marketing notifications sent today
    SELECT COUNT(*)
    INTO daily_count
    FROM public.notification_send_log
    WHERE user_id = target_user_id
      AND notification_type = 'marketing_offer'
      AND sent_at >= CURRENT_DATE
      AND sent_at < CURRENT_DATE + INTERVAL '1 day';
    
    -- Free users get max 1 marketing notification per day
    IF daily_count >= 1 THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Create function to record notification sent
CREATE OR REPLACE FUNCTION public.record_notification_sent(
  target_user_id UUID,
  notification_type TEXT,
  channel_type TEXT DEFAULT 'push',
  success_status BOOLEAN DEFAULT true,
  notification_metadata JSONB DEFAULT '{}'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notification_send_log (
    user_id, 
    notification_type, 
    channel, 
    success, 
    metadata
  ) VALUES (
    target_user_id, 
    notification_type, 
    channel_type, 
    success_status, 
    notification_metadata
  );
END;
$$;