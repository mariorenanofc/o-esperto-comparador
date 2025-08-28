-- Create rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  endpoint_name text,
  max_attempts integer DEFAULT 10,
  window_minutes integer DEFAULT 60,
  block_minutes integer DEFAULT 30
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_attempts integer := 0;
  current_window timestamp with time zone;
  blocked_until_time timestamp with time zone;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Allow if no user (for public endpoints)
  IF current_user_id IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if user is currently blocked
  SELECT blocked_until INTO blocked_until_time
  FROM rate_limits
  WHERE user_id = current_user_id
    AND endpoint = endpoint_name
    AND blocked_until > now()
  ORDER BY blocked_until DESC
  LIMIT 1;
  
  IF blocked_until_time IS NOT NULL THEN
    RETURN false; -- User is blocked
  END IF;
  
  -- Get current window start
  current_window := now() - (window_minutes || ' minutes')::interval;
  
  -- Count attempts in current window
  SELECT COALESCE(SUM(attempts), 0) INTO current_attempts
  FROM rate_limits
  WHERE user_id = current_user_id
    AND endpoint = endpoint_name
    AND window_start > current_window;
  
  -- If over limit, block user
  IF current_attempts >= max_attempts THEN
    INSERT INTO rate_limits (user_id, endpoint, attempts, blocked_until)
    VALUES (
      current_user_id,
      endpoint_name,
      1,
      now() + (block_minutes || ' minutes')::interval
    )
    ON CONFLICT (user_id, endpoint, window_start) DO NOTHING;
    RETURN false;
  END IF;
  
  -- Record this attempt
  INSERT INTO rate_limits (user_id, endpoint, attempts, window_start)
  VALUES (current_user_id, endpoint_name, 1, date_trunc('minute', now()))
  ON CONFLICT (user_id, endpoint, window_start) 
  DO UPDATE SET 
    attempts = rate_limits.attempts + 1,
    updated_at = now();
  
  RETURN true;
END;
$function$;

-- Input validation functions
CREATE OR REPLACE FUNCTION public.validate_email(email_input text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $function$
BEGIN
  RETURN email_input ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_price(price_input numeric)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $function$
BEGIN
  RETURN price_input > 0 AND price_input < 999999.99;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sanitize_text_input(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $function$
BEGIN
  -- Remove potential XSS characters and limit length
  RETURN LEFT(REGEXP_REPLACE(TRIM(input_text), '[<>\"''&]', '', 'g'), 500);
END;
$function$;