-- Create function to check if user can receive notification (fixed syntax)
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
  check_time TIME;
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
    check_time := CURRENT_TIME;
    
    -- Handle quiet hours that cross midnight
    IF quiet_start > quiet_end THEN
      -- Quiet hours cross midnight (e.g., 22:00 to 08:00)
      IF check_time >= quiet_start OR check_time <= quiet_end THEN
        RETURN FALSE;
      END IF;
    ELSE
      -- Normal quiet hours (e.g., 01:00 to 05:00)
      IF check_time >= quiet_start AND check_time <= quiet_end THEN
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