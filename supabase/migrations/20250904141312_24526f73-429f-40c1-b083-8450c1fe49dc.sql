-- Fix security issues found by linter

-- 1. Recreate daily_offers_public view without SECURITY DEFINER
-- and ensure it uses security_invoker instead of security_definer
DROP VIEW IF EXISTS public.daily_offers_public;

CREATE VIEW public.daily_offers_public
WITH (security_invoker = true)
AS SELECT 
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
WHERE verified = true;

-- Ensure the view has proper RLS enabled
-- Views inherit RLS from underlying tables, so this should be secure