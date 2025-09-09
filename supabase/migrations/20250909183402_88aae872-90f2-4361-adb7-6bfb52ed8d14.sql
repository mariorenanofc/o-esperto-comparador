-- Fix Security Definer View issue by removing the insecure view
-- and implementing proper RLS policies for public access to daily offers

-- Drop the problematic view that bypasses RLS
DROP VIEW IF EXISTS public.daily_offers_public;

-- Create a new RLS policy for public access to verified offers from last 24 hours
-- This replaces the view functionality with secure RLS
CREATE POLICY "Public can view verified recent offers" 
ON public.daily_offers 
FOR SELECT 
USING (
  verified = true 
  AND created_at >= (now() - interval '24 hours')
);

-- Ensure RLS is enabled on the table (should already be enabled)
ALTER TABLE public.daily_offers ENABLE ROW LEVEL SECURITY;