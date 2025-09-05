-- Fix security issue: Add RLS policies to daily_offers_public view
-- This view currently exposes sensitive shopping data without access controls

-- Enable RLS on the daily_offers_public view
ALTER TABLE daily_offers_public ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can view verified offers (public shopping data)
-- This allows the app to show verified daily offers to logged-in users
CREATE POLICY "Authenticated users can view verified public offers"
ON daily_offers_public
FOR SELECT
TO authenticated
USING (verified = true);

-- Policy 2: Admins can view all offers (verified and unverified)
-- This allows admins to moderate and manage all offers
CREATE POLICY "Admins can view all public offers"
ON daily_offers_public
FOR SELECT
TO authenticated
USING (is_user_admin());

-- Policy 3: Service role can access for system operations
-- This ensures edge functions and system processes can still access the data
CREATE POLICY "Service role can access public offers"
ON daily_offers_public
FOR SELECT
TO service_role
USING (true);