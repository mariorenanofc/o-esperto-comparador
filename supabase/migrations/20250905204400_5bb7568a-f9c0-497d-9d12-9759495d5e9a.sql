-- Fix security issue with daily_offers_public view
-- Since views can't have RLS, we'll replace it with a secure view that only shows recent verified offers

-- 1. Drop the existing public view
DROP VIEW IF EXISTS public.daily_offers_public;

-- 2. Create a secure view that only shows verified offers from last 24 hours
CREATE VIEW public.daily_offers_public AS
SELECT 
  id,
  product_name,
  store_name,
  price,
  quantity,
  unit,
  city,
  state,
  verified,
  created_at
FROM public.daily_offers
WHERE verified = true 
  AND created_at >= (now() - interval '1 day');

-- 3. Grant SELECT permissions to public roles
GRANT SELECT ON public.daily_offers_public TO anon, authenticated;

-- 4. Add security comment
COMMENT ON VIEW public.daily_offers_public IS 'Secure public view of daily offers - only shows verified offers from the last 24 hours to prevent market data exposure';

-- 5. Create performance index on the underlying table to support the view
CREATE INDEX IF NOT EXISTS idx_daily_offers_verified_created_at
ON public.daily_offers (verified, created_at DESC)
WHERE verified = true AND created_at >= (now() - interval '1 day');