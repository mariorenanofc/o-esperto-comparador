-- Fix the trigger function to allow verified offers for admins or when explicitly set
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
  
  -- Validate user ownership
  IF NEW.user_id <> auth.uid() AND current_user <> 'service_role' THEN
    RAISE EXCEPTION 'Cannot create offers for other users';
  END IF;
  
  -- Only force verified = false for regular users, allow admins and service role to set verified = true
  IF current_user <> 'service_role' AND NOT is_user_admin() THEN
    NEW.verified := false;
  END IF;
  -- Otherwise keep the value as set (allows admins/service_role to create verified offers)
  
  RETURN NEW;
END;
$function$;