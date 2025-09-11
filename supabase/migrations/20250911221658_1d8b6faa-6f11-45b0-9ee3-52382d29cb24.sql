-- ============================================================================
-- FASE 1: PERFORMANCE, CACHE E SEGURANÇA - OTIMIZAÇÕES (CORRIGIDA)
-- ============================================================================

-- 1. HABILITAR EXTENSÃO TRIGRAM PARA BUSCA FUZZY (se não existir)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. ÍNDICES PARA PERFORMANCE DE BUSCA (sem CONCURRENTLY)
-- Índice para busca de produtos por nome (ILIKE é case insensitive)
CREATE INDEX IF NOT EXISTS idx_products_name_search 
ON products USING gin(name gin_trgm_ops);

-- Índice para categoria (usado nas filtragens)
CREATE INDEX IF NOT EXISTS idx_products_category 
ON products (category);

-- Índice composto para ordenação por nome dentro da categoria
CREATE INDEX IF NOT EXISTS idx_products_category_name 
ON products (category, name);

-- Índice para ofertas diárias por localização e data
CREATE INDEX IF NOT EXISTS idx_daily_offers_location_date 
ON daily_offers (city, state, created_at DESC) WHERE verified = true;

-- Índice para ofertas recentes (últimas 24h)
CREATE INDEX IF NOT EXISTS idx_daily_offers_recent 
ON daily_offers (created_at DESC) WHERE verified = true AND created_at >= (now() - interval '24 hours');

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
  -- Se tem termo de busca, usar busca fuzzy com trigram
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
    -- Busca simples por categoria
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

-- 4. FUNÇÃO PARA OFERTAS OTIMIZADAS POR LOCALIZAÇÃO
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
    do.id,
    do.product_name,
    do.store_name,
    do.price,
    do.city,
    do.state,
    do.created_at,
    do.contributor_name,
    do.quantity,
    do.unit
  FROM daily_offers do
  WHERE 
    do.verified = true
    AND do.created_at >= (now() - (hours_back || ' hours')::interval)
    AND (city_param IS NULL OR do.city ILIKE city_param)
    AND (state_param IS NULL OR do.state ILIKE state_param)
  ORDER BY do.created_at DESC
  LIMIT 50;
END;
$$;

-- 5. FUNÇÃO PARA ESTATÍSTICAS DE PERFORMANCE
CREATE OR REPLACE FUNCTION get_performance_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats jsonb;
  total_products integer;
  total_offers integer;
  recent_offers integer;
  avg_response_time numeric;
BEGIN
  -- Apenas admins podem ver stats
  IF NOT is_user_admin() THEN
    RAISE EXCEPTION 'Insufficient privileges' USING ERRCODE = '42501';
  END IF;

  SELECT COUNT(*) INTO total_products FROM products;
  SELECT COUNT(*) INTO total_offers FROM daily_offers;
  SELECT COUNT(*) INTO recent_offers 
  FROM daily_offers 
  WHERE created_at >= (now() - interval '24 hours') AND verified = true;

  -- Média de tempo de resposta das APIs (se existir log)
  SELECT AVG(response_time_ms) INTO avg_response_time
  FROM api_performance_logs
  WHERE created_at >= (now() - interval '1 hour');

  stats := jsonb_build_object(
    'total_products', total_products,
    'total_offers', total_offers,
    'recent_offers_24h', recent_offers,
    'avg_response_time_ms', COALESCE(avg_response_time, 0),
    'cache_optimization_active', true,
    'indexes_created', true,
    'last_updated', now()
  );

  RETURN stats;
END;
$$;