-- Fix security issues found by linter

-- 1. Recreate daily_offers_public view without SECURITY DEFINER
DROP VIEW IF EXISTS public.daily_offers_public;
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
WHERE verified = true;

-- Enable RLS on the view if not already enabled
ALTER VIEW public.daily_offers_public SET (security_invoker = true);

-- 2. Move pg_net extension to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_net SET SCHEMA extensions;

-- 3. Clean up any remaining security issues
-- Ensure all functions use proper security context
-- (The password protection issue needs to be fixed in Supabase dashboard)