-- Remove email visibility from admin profile access for security
-- Create more restrictive RLS policies for profiles table

-- Drop existing admin view policy that exposes emails
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create new restrictive admin policy that doesn't expose emails unnecessarily
CREATE POLICY "Admins can view profile metadata"
  ON public.profiles
  FOR SELECT
  USING (
    is_user_admin() AND 
    -- Restrict email access only for admin functions, not general viewing
    (
      auth.uid() = id OR 
      -- Only allow email access in specific admin contexts
      current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    )
  );

-- Strengthen subscribers table RLS policies
-- Remove broad access and implement user-specific policies
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create more restrictive update policy for subscribers
CREATE POLICY "update_own_subscription_restricted"
  ON public.subscribers
  FOR UPDATE
  USING (user_id = auth.uid() OR email = auth.email())
  WITH CHECK (user_id = auth.uid() OR email = auth.email());

-- Add security function to mask sensitive data in admin queries
CREATE OR REPLACE FUNCTION mask_sensitive_admin_data(email_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return full email for actual admin operations, mask for viewing
  IF current_setting('app.admin_operation', true) = 'true' THEN
    RETURN email_input;
  ELSE
    RETURN left(email_input, 3) || '***@' || split_part(email_input, '@', 2);
  END IF;
END;
$$;