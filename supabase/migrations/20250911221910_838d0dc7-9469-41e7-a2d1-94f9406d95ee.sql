-- ============================================================================
-- FASE 1: PERFORMANCE E ÍNDICES BÁSICOS
-- ============================================================================

-- 1. HABILITAR EXTENSÃO TRIGRAM PARA BUSCA FUZZY (se não existir)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. ÍNDICES BÁSICOS PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_name_search 
ON products USING gin(name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_category 
ON products (category);

CREATE INDEX IF NOT EXISTS idx_products_category_name 
ON products (category, name);

CREATE INDEX IF NOT EXISTS idx_daily_offers_location_date 
ON daily_offers (city, state, created_at DESC) WHERE verified = true;

CREATE INDEX IF NOT EXISTS idx_daily_offers_date_verified 
ON daily_offers (created_at DESC, verified);

-- 3. FUNÇÃO OTIMIZADA DE BUSCA DE PRODUTOS
CREATE OR REPLACE FUNCTION search_products_optimized(
  search_term text DEFAULT NULL,
  category_filter text DEFAULT NULL,
  limit_count integer DEFAULT 100
)
RETURNS TABLE(
  id uuid,
  name text,
  category text,
  unit text,
  quantity integer,
  created_at timestamptz,
  similarity_score real
) 
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF search_term IS NOT NULL AND LENGTH(TRIM(search_term)) > 0 THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.name,
      p.category,
      p.unit,
      p.quantity,
      p.created_at,
      SIMILARITY(p.name, search_term) as similarity_score
    FROM products p
    WHERE 
      (category_filter IS NULL OR p.category = category_filter)
      AND (
        p.name ILIKE ('%' || search_term || '%') 
        OR SIMILARITY(p.name, search_term) > 0.3
      )
    ORDER BY 
      SIMILARITY(p.name, search_term) DESC,
      p.name ASC
    LIMIT limit_count;
  ELSE
    RETURN QUERY
    SELECT 
      p.id,
      p.name,
      p.category,
      p.unit,
      p.quantity,
      p.created_at,
      0.0 as similarity_score
    FROM products p
    WHERE (category_filter IS NULL OR p.category = category_filter)
    ORDER BY p.name ASC
    LIMIT limit_count;
  END IF;
END;
$$;

-- 4. FUNÇÃO PARA OFERTAS POR LOCALIZAÇÃO (sem alias problemático)
CREATE OR REPLACE FUNCTION get_offers_by_location(
  city_param text DEFAULT NULL,
  state_param text DEFAULT NULL,
  hours_back integer DEFAULT 24
)
RETURNS TABLE(
  id uuid,
  product_name text,
  store_name text,
  price numeric,
  city text,
  state text,
  created_at timestamptz,
  contributor_name text,
  quantity integer,
  unit text
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    daily_offers.id,
    daily_offers.product_name,
    daily_offers.store_name,
    daily_offers.price,
    daily_offers.city,
    daily_offers.state,
    daily_offers.created_at,
    daily_offers.contributor_name,
    daily_offers.quantity,
    daily_offers.unit
  FROM daily_offers 
  WHERE 
    daily_offers.verified = true
    AND daily_offers.created_at >= (now() - (hours_back || ' hours')::interval)
    AND (city_param IS NULL OR daily_offers.city ILIKE city_param)
    AND (state_param IS NULL OR daily_offers.state ILIKE state_param)
  ORDER BY daily_offers.created_at DESC
  LIMIT 50;
END;
$$;