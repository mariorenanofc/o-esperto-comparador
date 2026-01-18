-- ==========================================
-- OPTIMIZED SEARCH FUNCTION (FIXED)
-- ==========================================
CREATE OR REPLACE FUNCTION public.search_offers_optimized(
  search_query text DEFAULT NULL,
  city_filter text DEFAULT NULL,
  state_filter text DEFAULT NULL,
  limit_count int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  product_name text,
  store_name text,
  price numeric,
  city text,
  state text,
  created_at timestamptz,
  contributor_name text,
  relevance_score real
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    offers.id,
    offers.product_name,
    offers.store_name,
    offers.price,
    offers.city,
    offers.state,
    offers.created_at,
    offers.contributor_name,
    CASE 
      WHEN search_query IS NOT NULL THEN
        ts_rank(to_tsvector('portuguese', offers.product_name), plainto_tsquery('portuguese', search_query))
      ELSE 1.0
    END::real as relevance_score
  FROM public.daily_offers offers
  WHERE offers.verified = true
    AND offers.created_at > NOW() - INTERVAL '24 hours'
    AND (city_filter IS NULL OR offers.city = city_filter)
    AND (state_filter IS NULL OR offers.state = state_filter)
    AND (search_query IS NULL OR to_tsvector('portuguese', offers.product_name) @@ plainto_tsquery('portuguese', search_query))
  ORDER BY 
    CASE WHEN search_query IS NOT NULL THEN relevance_score ELSE 0 END DESC,
    offers.created_at DESC
  LIMIT limit_count;
END;
$$;

-- ==========================================
-- OPTIMIZED RANKING FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION public.get_store_ranking_by_city(
  target_city text,
  target_state text DEFAULT NULL
)
RETURNS TABLE (
  store_name text,
  avg_price numeric,
  total_products bigint,
  min_price numeric,
  max_price numeric,
  rank_position bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH store_stats AS (
    SELECT 
      offers.store_name,
      AVG(offers.price)::numeric as avg_price,
      COUNT(*)::bigint as total_products,
      MIN(offers.price)::numeric as min_price,
      MAX(offers.price)::numeric as max_price
    FROM public.daily_offers offers
    WHERE offers.verified = true
      AND offers.created_at > NOW() - INTERVAL '7 days'
      AND offers.city = target_city
      AND (target_state IS NULL OR offers.state = target_state)
    GROUP BY offers.store_name
    HAVING COUNT(*) >= 3
  )
  SELECT 
    ss.store_name,
    ss.avg_price,
    ss.total_products,
    ss.min_price,
    ss.max_price,
    ROW_NUMBER() OVER (ORDER BY ss.avg_price ASC)::bigint as rank_position
  FROM store_stats ss
  ORDER BY ss.avg_price ASC;
END;
$$;