-- Fix: Allow profile creation during OAuth callback
-- The issue is that auth.uid() is NULL during the trigger execution from handle_new_user
-- but the INSERT is legitimate if the ID exists in auth.users

CREATE OR REPLACE FUNCTION public.enhanced_guard_profile_update()
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

  -- Allow system operations for admin setup
  IF current_setting('app.system_operation', true) = 'admin_setup' THEN
    RETURN NEW;
  END IF;

  -- For INSERT operations (new user profile creation)
  -- During OAuth callback, auth.uid() is NULL but the INSERT is legitimate
  -- We verify by checking if the ID exists in auth.users
  IF TG_OP = 'INSERT' THEN
    -- Verify the profile ID matches a valid auth user
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.id) THEN
      -- Force new users to free plan with default values
      NEW.plan := 'free';
      NEW.comparisons_made_this_month := 0;
      NEW.last_comparison_reset_month := EXTRACT(month FROM now());
      RETURN NEW;
    END IF;
    -- If ID doesn't exist in auth.users, block the creation
    RAISE EXCEPTION 'Invalid user ID for profile creation';
  END IF;

  -- For UPDATE operations, require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated';
  END IF;

  -- Only allow self updates for non-admin users
  IF NEW.id <> auth.uid() THEN
    IF NOT public.is_user_admin() THEN
      RAISE EXCEPTION 'Cannot update other user profiles';
    END IF;
  END IF;

  -- Block changes to sensitive fields for non-admin users
  IF TG_OP = 'UPDATE' THEN
    IF NEW.plan IS DISTINCT FROM OLD.plan THEN
      IF NOT public.is_user_admin() THEN
        RAISE EXCEPTION 'Insufficient privileges to modify plan';
      END IF;
      
      -- Prevent setting admin plan unless it's for specific emails
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
$function$;

-- Also update guard_profile_sensitive_update to be consistent
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

  -- Allow system operations for admin setup
  IF current_setting('app.system_operation', true) = 'admin_setup' THEN
    RETURN NEW;
  END IF;

  -- For INSERT: allow if ID exists in auth.users (handles OAuth callback)
  IF TG_OP = 'INSERT' THEN
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.id) THEN
      NEW.plan := 'free';
      NEW.comparisons_made_this_month := 0;
      NEW.last_comparison_reset_month := EXTRACT(month FROM now());
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Invalid user ID for profile creation';
  END IF;

  -- Require authentication for updates
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated';
  END IF;

  -- Only allow self updates for non-admin users
  IF NEW.id <> auth.uid() THEN
    IF NOT public.is_user_admin() THEN
      RAISE EXCEPTION 'Cannot update other user profiles';
    END IF;
  END IF;

  -- Block changes to sensitive fields for non-admin users
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    IF NOT public.is_user_admin() THEN
      RAISE EXCEPTION 'Insufficient privileges to modify plan';
    END IF;
    
    IF NEW.plan = 'admin' AND NEW.email NOT IN ('mariorenan25@gmail.com', 'mariovendasonline10k@gmail.com') THEN
      RAISE EXCEPTION 'Cannot assign admin privileges';
    END IF;
  END IF;

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

  RETURN NEW;
END;
$function$;