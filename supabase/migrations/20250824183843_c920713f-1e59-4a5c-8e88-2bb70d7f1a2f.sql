
-- 1) Ensure current admins are set via plan (one-time)
UPDATE public.profiles
SET plan = 'admin'
WHERE email IN ('mariovendasonline10k@gmail.com','mariorenan25@gmail.com');

-- 2) Replace is_user_admin() to remove email allowlist (plan only) and harden search_path
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles 
    WHERE id = auth.uid()
      AND plan = 'admin'
  );
$function$;

-- 3) Guard sensitive profile updates with a trigger
CREATE OR REPLACE FUNCTION public.guard_profile_sensitive_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

DROP TRIGGER IF EXISTS trg_guard_profile_sensitive_update ON public.profiles;
CREATE TRIGGER trg_guard_profile_sensitive_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.guard_profile_sensitive_update();

-- 4) Tighten the profiles UPDATE policy (ensure WITH CHECK)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5) Tighten subscribers INSERT policy
DROP POLICY IF EXISTS insert_subscription ON public.subscribers;
CREATE POLICY "insert_subscription"
  ON public.subscribers
  FOR INSERT
  TO authenticated
  WITH CHECK ((user_id = auth.uid()) OR (email = auth.email()));

-- 6) Add search_path hardening on functions flagged by linter (safe idempotent changes)
ALTER FUNCTION public.set_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.sync_profile_plan_from_subscriber() SET search_path TO 'public';
ALTER FUNCTION public.check_user_feature_access(text, integer) SET search_path TO 'public';
ALTER FUNCTION public.user_plan_access() SET search_path TO 'public';
ALTER FUNCTION public.reset_monthly_comparisons() SET search_path TO 'public';
ALTER FUNCTION public.update_user_activity() SET search_path TO 'public';
ALTER FUNCTION public.mark_inactive_users_offline() SET search_path TO 'public';

-- 7) Prepare a public-safe view for daily offers (Phase 2 – app can switch later)
CREATE OR REPLACE VIEW public.daily_offers_public AS
SELECT
  id,
  product_name,
  store_name,
  city,
  state,
  price,
  unit,
  quantity,
  verified,
  created_at
FROM public.daily_offers
WHERE verified IS TRUE;

-- Note: Views don't use RLS. This view purposely excludes user_id and contributor_name (PII).
-- Your app should be updated to read from daily_offers_public instead of daily_offers.
