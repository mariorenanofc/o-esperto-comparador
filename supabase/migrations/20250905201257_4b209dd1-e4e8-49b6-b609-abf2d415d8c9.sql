-- Fix security issue: Secure the daily_offers_public view
-- The current view bypasses RLS policies from the underlying daily_offers table

-- Drop the existing insecure view
DROP VIEW IF EXISTS daily_offers_public;

-- Recreate the view with proper security context that respects underlying RLS policies
-- This view will now inherit the RLS policies from the daily_offers table
CREATE VIEW daily_offers_public 
WITH (security_invoker = true) AS
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

-- Add a comment explaining the security model
COMMENT ON VIEW daily_offers_public IS 'Public view of verified daily offers. Uses security_invoker=true to respect RLS policies from underlying daily_offers table.';