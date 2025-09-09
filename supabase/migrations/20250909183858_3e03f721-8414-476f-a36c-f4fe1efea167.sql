-- SECURITY FIXES: Implement critical database-level protections and cleanup

-- 1. CRITICAL: Attach security trigger to profiles table to prevent privilege escalation
DROP TRIGGER IF EXISTS guard_profile_updates ON public.profiles;
CREATE TRIGGER guard_profile_updates
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_guard_profile_update();

-- 2. Attach validation triggers to enforce data integrity
DROP TRIGGER IF EXISTS validate_daily_offer_data ON public.daily_offers;
CREATE TRIGGER validate_daily_offer_data
  BEFORE INSERT OR UPDATE ON public.daily_offers
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_validate_daily_offer_input();

DROP TRIGGER IF EXISTS validate_product_data ON public.products;
CREATE TRIGGER validate_product_data
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_validate_product_data();

-- 3. Add updated_at triggers for consistency
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Create secure cleanup function for guaranteed 30-day retention
CREATE OR REPLACE FUNCTION public.cleanup_old_daily_offers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow this to run in automated context or by admins
  IF current_user <> 'service_role' AND NOT is_user_admin() THEN
    RAISE EXCEPTION 'Insufficient privileges for cleanup operation';
  END IF;

  -- Delete offers older than 30 days
  DELETE FROM public.daily_offers 
  WHERE created_at < (now() - interval '30 days');
  
  -- Log the cleanup for audit purposes
  PERFORM log_admin_action(
    'CLEANUP_OLD_OFFERS',
    NULL,
    jsonb_build_object(
      'cleanup_date', now(),
      'retention_days', 30,
      'executor', current_user
    )
  );
END;
$$;

-- 5. Create index for efficient cleanup operations
CREATE INDEX IF NOT EXISTS idx_daily_offers_created_at 
ON public.daily_offers(created_at);

-- 6. Schedule automated cleanup to run daily at 2 AM
SELECT cron.schedule(
  'cleanup_old_offers_daily',
  '0 2 * * *', -- Daily at 2 AM
  $$SELECT public.cleanup_old_daily_offers();$$
);

-- 7. Restrict product_prices to authenticated users only (business security)
DROP POLICY IF EXISTS "Anyone can view product prices" ON public.product_prices;
CREATE POLICY "Authenticated users can view product prices" 
ON public.product_prices 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 8. Add comprehensive audit logging for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_sensitive_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log plan changes
  IF TG_TABLE_NAME = 'profiles' AND OLD.plan IS DISTINCT FROM NEW.plan THEN
    PERFORM log_admin_action(
      'PLAN_CHANGE',
      NEW.id,
      jsonb_build_object(
        'old_plan', OLD.plan,
        'new_plan', NEW.plan,
        'changed_by', auth.uid()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_profile_changes ON public.profiles;
CREATE TRIGGER audit_profile_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();