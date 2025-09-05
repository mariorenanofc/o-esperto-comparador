-- Secure daily_offers_public without breaking public functionality
-- 1) Enable RLS on the public projection table
ALTER TABLE public.daily_offers_public ENABLE ROW LEVEL SECURITY;

-- 2) Ensure roles have SELECT privilege (RLS will filter rows)
GRANT SELECT ON public.daily_offers_public TO anon, authenticated;
GRANT SELECT ON public.daily_offers_public TO service_role;

-- 3) Restrictive public policy: only verified offers from last 24 hours
CREATE POLICY "Public can view verified recent offers"
ON public.daily_offers_public
FOR SELECT
TO anon, authenticated
USING (
  verified = true
  AND created_at >= (now() - interval '1 day')
);

-- 4) Admin can view all rows
CREATE POLICY "Admins can view all (public projection)"
ON public.daily_offers_public
FOR SELECT
TO authenticated
USING (public.is_user_admin());

-- 5) Service role (edge functions) can view all rows
CREATE POLICY "Service role can view all (public projection)"
ON public.daily_offers_public
FOR SELECT
TO service_role
USING (true);

-- 6) No INSERT/UPDATE/DELETE policies are created -> operations are denied by default under RLS

-- 7) Performance index for the policy filter
CREATE INDEX IF NOT EXISTS idx_daily_offers_public_verified_created_at
ON public.daily_offers_public (verified, created_at DESC);

-- 8) Optional documentation
COMMENT ON TABLE public.daily_offers_public IS 'Public projection of daily offers. RLS restricts anon/auth to verified offers from the last 24h.';