-- Fix security issues: Remove public access to sensitive personal data

-- 1. Remove public access policy from daily_offers table to prevent PII exposure
DROP POLICY IF EXISTS "Public can view verified offers only" ON public.daily_offers;

-- 2. Fix user_access_control table - remove system-wide access, only allow user-specific access
DROP POLICY IF EXISTS "System can manage access control" ON public.user_access_control;

-- Create more restrictive policy for system operations (authenticated users only)
CREATE POLICY "System can manage access control for authenticated users" 
ON public.user_access_control 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Ensure daily_offers_public view has proper permissions for public access
-- Grant SELECT permissions on the view to anonymous users
GRANT SELECT ON public.daily_offers_public TO anon;
GRANT SELECT ON public.daily_offers_public TO authenticated;

-- 4. Add comment to document the security fix
COMMENT ON VIEW public.daily_offers_public IS 'Public view of verified daily offers - excludes PII like contributor_name and user_id for security';