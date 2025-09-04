-- Comprehensive Security Fixes Migration

-- 1. RLS POLICY FIXES

-- Fix notifications table - allow users to manage their own notifications
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Remove system-writable policies from sensitive tables
DROP POLICY IF EXISTS "System can insert notification logs" ON public.notification_send_log;
DROP POLICY IF EXISTS "System can insert rate limits" ON public.rate_limits;  
DROP POLICY IF EXISTS "System can update rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "System can insert payment history" ON public.subscription_history;
DROP POLICY IF EXISTS "System can update payment history" ON public.subscription_history;

-- Create function-specific policies for system operations
CREATE POLICY "Service role can manage notification logs" 
ON public.notification_send_log 
FOR ALL 
USING (current_user = 'service_role');

CREATE POLICY "Service role can manage rate limits" 
ON public.rate_limits 
FOR ALL 
USING (current_user = 'service_role');

CREATE POLICY "Service role can manage subscription history" 
ON public.subscription_history 
FOR ALL 
USING (current_user = 'service_role');

-- 2. DATABASE TRIGGERS FOR SECURITY

-- Enhanced profile security trigger (replace existing one)
DROP TRIGGER IF EXISTS guard_profile_sensitive_update ON public.profiles;
CREATE OR REPLACE FUNCTION public.enhanced_guard_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow service role operations
  IF current_user = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Allow system operations for admin setup
  IF current_setting('app.system_operation', true) = 'admin_setup' THEN
    RETURN NEW;
  END IF;

  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated';
  END IF;

  -- Only allow self updates for non-admin users
  IF NEW.id <> auth.uid() THEN
    IF NOT public.is_user_admin() THEN
      RAISE EXCEPTION 'Cannot update other user profiles';
    END IF;
  END IF;

  -- Force new users to free plan
  IF TG_OP = 'INSERT' THEN
    NEW.plan := 'free';
    NEW.comparisons_made_this_month := 0;
    NEW.last_comparison_reset_month := EXTRACT(month FROM now());
  END IF;

  -- Block changes to sensitive fields for non-admin users
  IF TG_OP = 'UPDATE' THEN
    IF NEW.plan IS DISTINCT FROM OLD.plan THEN
      IF NOT public.is_user_admin() THEN
        RAISE EXCEPTION 'Insufficient privileges to modify plan';
      END IF;
      
      -- Prevent setting admin plan unless user is already admin AND it's for specific emails
      IF NEW.plan = 'admin' AND NEW.email NOT IN ('mariorenan25@gmail.com', 'mariovendasonline10k@gmail.com') THEN
        RAISE EXCEPTION 'Cannot assign admin privileges';
      END IF;
    END IF;

    -- Block other sensitive field changes for non-admin users
    IF NOT public.is_user_admin() AND (
       NEW.email IS DISTINCT FROM OLD.email
       OR NEW.comparisons_made_this_month IS DISTINCT FROM OLD.comparisons_made_this_month
       OR NEW.last_comparison_reset_month IS DISTINCT FROM OLD.last_comparison_reset_month
    ) THEN
      RAISE EXCEPTION 'Insufficient privileges to modify sensitive fields';
    END IF;

    -- Force admin plan for specific emails
    IF NEW.email IN ('mariorenan25@gmail.com', 'mariovendasonline10k@gmail.com') THEN
      NEW.plan := 'admin';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enhanced_guard_profile_update
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_guard_profile_update();

-- Enhanced daily offers validation trigger (replace existing one)
DROP TRIGGER IF EXISTS validate_daily_offer_input ON public.daily_offers;
CREATE OR REPLACE FUNCTION public.enhanced_validate_daily_offer_input()
RETURNS TRIGGER AS $$
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
  
  -- Auto-verify offers from trusted sources or mark as unverified
  NEW.verified := false;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enhanced_validate_daily_offer_input
  BEFORE INSERT OR UPDATE ON public.daily_offers
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_validate_daily_offer_input();

-- Enhanced product validation trigger (replace existing one)
DROP TRIGGER IF EXISTS validate_product_data ON public.products;
CREATE OR REPLACE FUNCTION public.enhanced_validate_product_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Sanitize and validate name
  NEW.name := sanitize_text_input(NEW.name);
  IF NEW.name IS NULL OR LENGTH(TRIM(NEW.name)) < 2 THEN
    RAISE EXCEPTION 'Nome do produto deve ter pelo menos 2 caracteres';
  END IF;
  
  -- Sanitize and validate category
  NEW.category := sanitize_text_input(COALESCE(NEW.category, 'outros'));
  IF NEW.category = '' THEN
    NEW.category := 'outros';
  END IF;
  
  -- Sanitize and validate unit
  NEW.unit := sanitize_text_input(COALESCE(NEW.unit, 'unidade'));
  IF NEW.unit = '' THEN
    NEW.unit := 'unidade';
  END IF;
  
  -- Validate quantity
  IF NEW.quantity IS NULL OR NEW.quantity <= 0 THEN
    NEW.quantity := 1;
  END IF;
  
  -- Ensure that the category exists in the table categories
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = NEW.category) THEN
    NEW.category := 'outros';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enhanced_validate_product_data
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_validate_product_data();

-- Add triggers for timestamp updates
CREATE TRIGGER update_subscription_history_timestamps
  BEFORE UPDATE ON public.subscription_history
  FOR EACH ROW EXECUTE FUNCTION public.update_subscription_history_updated_at();

CREATE TRIGGER update_user_access_control_timestamps
  BEFORE UPDATE ON public.user_access_control
  FOR EACH ROW EXECUTE FUNCTION public.update_access_control_updated_at();

-- 3. ENHANCED SANITIZATION FUNCTIONS

-- Enhanced sanitization for better security
CREATE OR REPLACE FUNCTION public.enhanced_sanitize_text_input(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove potential XSS characters, SQL injection attempts, and limit length
  RETURN LEFT(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        TRIM(input_text), 
        '[<>\"''&;]', '', 'g'
      ),
      '(union|select|insert|update|delete|drop|create|alter)\s',
      '', 'gi'
    ), 
    500
  );
END;
$$;

-- Update existing sanitize function to use enhanced version
CREATE OR REPLACE FUNCTION public.sanitize_text_input(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN public.enhanced_sanitize_text_input(input_text);
END;
$$;

-- 4. AUDIT AND SECURITY LOGGING

-- Enhanced security event logging
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  severity text DEFAULT 'info',
  details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_user_id,
    details
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    event_type,
    NULL,
    jsonb_build_object(
      'severity', severity,
      'timestamp', now(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
      'details', details
    )
  );
END;
$$;

-- Comment for documentation
COMMENT ON MIGRATION IS 'Comprehensive security hardening: Enhanced RLS policies, input validation triggers, sanitization functions, and audit logging';