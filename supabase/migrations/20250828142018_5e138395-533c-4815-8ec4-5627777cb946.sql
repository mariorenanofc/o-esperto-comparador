-- Fix function search path issues by updating all functions
CREATE OR REPLACE FUNCTION public.validate_email(email_input text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN email_input ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_price(price_input numeric)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN price_input > 0 AND price_input < 999999.99;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sanitize_text_input(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
BEGIN
  -- Remove potential XSS characters and limit length
  RETURN LEFT(REGEXP_REPLACE(TRIM(input_text), '[<>\"''&]', '', 'g'), 500);
END;
$function$;

-- Session management and cleanup
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

-- Input validation trigger for daily_offers
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