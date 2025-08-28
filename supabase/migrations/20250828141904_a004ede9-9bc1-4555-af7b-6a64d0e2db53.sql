-- Fix Security Definer View issue by recreating the view properly
DO $$
BEGIN
  -- Drop any existing security definer views if they exist
  DROP VIEW IF EXISTS daily_offers_public CASCADE;
  
  -- Create a standard view without SECURITY DEFINER
  CREATE VIEW daily_offers_public AS
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
  FROM daily_offers
  WHERE verified = true;
  
  -- Grant appropriate permissions
  GRANT SELECT ON daily_offers_public TO anon, authenticated;
END $$;

-- Create extensions schema for better organization
CREATE SCHEMA IF NOT EXISTS extensions;

-- Create rate limiting table for API protection
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address inet,
  endpoint text NOT NULL,
  attempts integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, endpoint, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for rate limits
CREATE POLICY "Admins can view all rate limits" ON public.rate_limits
FOR SELECT USING (public.is_user_admin());

CREATE POLICY "Users can view their own rate limits" ON public.rate_limits
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert rate limits" ON public.rate_limits
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update rate limits" ON public.rate_limits
FOR UPDATE USING (true);