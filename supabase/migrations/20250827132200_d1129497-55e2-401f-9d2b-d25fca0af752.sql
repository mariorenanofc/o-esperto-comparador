-- Fix CRITICAL privilege escalation vulnerability in guard_profile_sensitive_update
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

  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated';
  END IF;

  -- Only allow self updates for non-admin users
  IF NEW.id <> auth.uid() THEN
    -- Check if current user is admin for updating other profiles
    IF NOT public.is_user_admin() THEN
      RAISE EXCEPTION 'Cannot update other user profiles';
    END IF;
  END IF;

  -- Block changes to sensitive fields for non-admin users
  -- CRITICAL FIX: Prevent any user from setting themselves as admin
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    -- Only admins can change plans, and only to non-admin plans for others
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

  RETURN NEW;
END;
$function$;

-- Add function to securely check admin status with proper authorization
CREATE OR REPLACE FUNCTION public.check_admin_with_auth()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN public.is_user_admin();
END;
$function$;

-- Clean up redundant RLS policies on profiles table
DROP POLICY IF EXISTS "Users can update own activity" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create single comprehensive policy for profile updates
CREATE POLICY "Secure profile updates" ON public.profiles
FOR UPDATE 
USING (
  auth.uid() = id OR public.is_user_admin()
)
WITH CHECK (
  auth.uid() = id OR public.is_user_admin()
);

-- Secure the daily_offers table - remove public access for unverified offers
DROP POLICY IF EXISTS "Anyone can view daily offers" ON public.daily_offers;

CREATE POLICY "Public can view verified offers only" ON public.daily_offers
FOR SELECT 
USING (verified = true);

CREATE POLICY "Admins can view all offers" ON public.daily_offers
FOR SELECT 
USING (public.is_user_admin());

CREATE POLICY "Users can view their own offers" ON public.daily_offers
FOR SELECT 
USING (auth.uid() = user_id);

-- Add audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  target_user_id uuid,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs" ON public.admin_audit_log
FOR SELECT USING (public.is_user_admin());

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type text,
  target_user uuid DEFAULT NULL,
  action_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only log if user is admin
  IF public.is_user_admin() THEN
    INSERT INTO public.admin_audit_log (admin_user_id, action, target_user_id, details)
    VALUES (auth.uid(), action_type, target_user, action_details);
  END IF;
END;
$function$;