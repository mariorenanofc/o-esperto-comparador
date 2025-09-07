-- Fix enhanced_validate_daily_offer_input to allow admin updates and restrict ownership check to INSERT only
CREATE OR REPLACE FUNCTION public.enhanced_validate_daily_offer_input()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate and sanitize inputs
  IF NOT validate_price(NEW.price) THEN
    RAISE EXCEPTION 'Preço inválido: deve ser maior que 0 e menor que 999999.99';
  END IF;
  
  -- Sanitize text fields with enhanced validation
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

  -- Ownership check only for INSERT by non-admins (avoid blocking admin updates)
  IF TG_OP = 'INSERT' THEN
    IF NEW.user_id IS DISTINCT FROM auth.uid() AND current_user <> 'service_role' AND NOT is_user_admin() THEN
      RAISE EXCEPTION 'Cannot create offers for other users';
    END IF;
  END IF;
  
  -- Only force verified = false for regular users; admins/service role can set true
  IF current_user <> 'service_role' AND NOT is_user_admin() THEN
    NEW.verified := false;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Ensure trigger is in place for INSERT and UPDATE using the corrected function
DROP TRIGGER IF EXISTS validate_daily_offer_input_trigger ON public.daily_offers;
CREATE TRIGGER validate_daily_offer_input_trigger
BEFORE INSERT OR UPDATE ON public.daily_offers
FOR EACH ROW EXECUTE FUNCTION public.enhanced_validate_daily_offer_input();