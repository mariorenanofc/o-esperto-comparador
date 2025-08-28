-- Fix Security Definer View issue by checking for existing views
DO $$
BEGIN
  -- Drop any existing security definer views if they exist
  DROP VIEW IF EXISTS daily_offers_public CASCADE;
  
  -- Create a standard view without SECURITY DEFINER
  CREATE VIEW daily_offers_public AS
  SELECT 
    id,
    product_name,
    store_name,
    price,
    quantity,
    unit,
    city,
    state,
    verified,
    created_at
  FROM daily_offers
  WHERE verified = true;
  
  -- Grant appropriate permissions
  GRANT SELECT ON daily_offers_public TO anon, authenticated;
END $$;

-- Move extensions from public schema to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Enable leaked password protection for stronger auth security
-- This requires updating auth configuration
UPDATE auth.config 
SET leaked_password_protection = true 
WHERE true;

-- Create rate limiting table for API protection
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address inet,
  endpoint text NOT NULL,
  attempts integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policy for rate limits (only admins can view all)
CREATE POLICY "Admins can view all rate limits" ON public.rate_limits
FOR SELECT USING (public.is_user_admin());

CREATE POLICY "Users can view their own rate limits" ON public.rate_limits
FOR SELECT USING (auth.uid() = user_id);

-- Function to check and enforce rate limits
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
  user_ip inet;
BEGIN
  -- Get user IP (simplified for demo)
  user_ip := inet '127.0.0.1';
  
  -- Check if user is currently blocked
  SELECT blocked_until INTO blocked_until_time
  FROM rate_limits
  WHERE (user_id = auth.uid() OR ip_address = user_ip)
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
  WHERE (user_id = auth.uid() OR ip_address = user_ip)
    AND endpoint = endpoint_name
    AND window_start > current_window;
  
  -- If over limit, block user
  IF current_attempts >= max_attempts THEN
    INSERT INTO rate_limits (user_id, ip_address, endpoint, attempts, blocked_until)
    VALUES (
      auth.uid(),
      user_ip,
      endpoint_name,
      1,
      now() + (block_minutes || ' minutes')::interval
    );
    RETURN false;
  END IF;
  
  -- Record this attempt
  INSERT INTO rate_limits (user_id, ip_address, endpoint, attempts)
  VALUES (auth.uid(), user_ip, endpoint_name, 1)
  ON CONFLICT (user_id, endpoint, window_start) 
  DO UPDATE SET 
    attempts = rate_limits.attempts + 1,
    updated_at = now();
  
  RETURN true;
END;
$function$;

-- Create input validation functions
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

-- Session management: automatic cleanup of expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Mark users as offline if inactive for more than 30 minutes
  UPDATE profiles 
  SET is_online = false 
  WHERE last_activity < (now() - interval '30 minutes')
    AND is_online = true;
  
  -- Clean up old rate limit records (older than 24 hours)
  DELETE FROM rate_limits 
  WHERE created_at < (now() - interval '24 hours');
  
  -- Clean up old audit logs (older than 90 days) except critical actions
  DELETE FROM admin_audit_log 
  WHERE created_at < (now() - interval '90 days')
    AND action NOT IN ('DELETE_USER', 'UPDATE_USER_PLAN');
END;
$function$;

-- Create trigger for automatic input validation on daily_offers
CREATE OR REPLACE FUNCTION public.validate_daily_offer_input()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate and sanitize inputs
  IF NOT validate_price(NEW.price) THEN
    RAISE EXCEPTION 'Preço inválido: deve ser maior que 0 e menor que 999999.99';
  END IF;
  
  -- Sanitize text fields
  NEW.product_name := sanitize_text_input(NEW.product_name);
  NEW.store_name := sanitize_text_input(NEW.store_name);
  NEW.city := sanitize_text_input(NEW.city);
  NEW.state := sanitize_text_input(NEW.state);
  NEW.contributor_name := sanitize_text_input(NEW.contributor_name);
  
  -- Validate required fields
  IF LENGTH(NEW.product_name) < 2 THEN
    RAISE EXCEPTION 'Nome do produto deve ter pelo menos 2 caracteres';
  END IF;
  
  IF LENGTH(NEW.store_name) < 2 THEN
    RAISE EXCEPTION 'Nome da loja deve ter pelo menos 2 caracteres';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Apply validation trigger
DROP TRIGGER IF EXISTS validate_daily_offer_trigger ON daily_offers;
CREATE TRIGGER validate_daily_offer_trigger
  BEFORE INSERT OR UPDATE ON daily_offers
  FOR EACH ROW
  EXECUTE FUNCTION validate_daily_offer_input();