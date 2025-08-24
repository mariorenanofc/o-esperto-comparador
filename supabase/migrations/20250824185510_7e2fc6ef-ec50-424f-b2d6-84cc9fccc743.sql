-- Fix Critical Security Issue #1: Prevent privilege escalation via profiles table
-- Create trigger to block unauthorized changes to sensitive fields

CREATE OR REPLACE FUNCTION public.guard_profile_sensitive_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Allow service role operations
  IF current_user = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated';
  END IF;

  -- Allow admins
  IF public.is_user_admin() THEN
    RETURN NEW;
  END IF;

  -- Only allow self updates
  IF NEW.id <> auth.uid() THEN
    RAISE EXCEPTION 'Cannot update other user profiles';
  END IF;

  -- Block changes to sensitive fields for non-admin users
  IF NEW.plan IS DISTINCT FROM OLD.plan
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.comparisons_made_this_month IS DISTINCT FROM OLD.comparisons_made_this_month
     OR NEW.last_comparison_reset_month IS DISTINCT FROM OLD.last_comparison_reset_month THEN
    RAISE EXCEPTION 'Insufficient privileges to modify profile sensitive fields';
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger on profiles table
DROP TRIGGER IF EXISTS guard_profile_sensitive_update_trigger ON public.profiles;
CREATE TRIGGER guard_profile_sensitive_update_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_profile_sensitive_update();

-- Fix Critical Security Issue #2: Create public view for daily offers without PII
CREATE OR REPLACE VIEW public.daily_offers_public AS
SELECT 
  id,
  product_name,
  store_name,
  price,
  quantity,
  unit,
  city,
  state,
  created_at,
  verified
FROM public.daily_offers
WHERE verified = true;

-- Grant access to the view
GRANT SELECT ON public.daily_offers_public TO authenticated, anon;