-- Function to get database usage and largest tables
CREATE OR REPLACE FUNCTION public.get_db_usage(limit_bytes bigint DEFAULT 524288000)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  db_size_bytes bigint;
  percent_used numeric;
  tables jsonb;
BEGIN
  -- Only admins can execute
  IF NOT public.is_user_admin() THEN
    RAISE EXCEPTION 'Insufficient privileges' USING ERRCODE = '42501';
  END IF;

  -- Total database size
  SELECT pg_database_size(current_database()) INTO db_size_bytes;

  percent_used := (db_size_bytes::numeric / NULLIF(limit_bytes,0)::numeric) * 100;

  -- Table sizes in public schema
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'table', c.relname,
        'size_bytes', pg_total_relation_size(format('%I.%I', n.nspname, c.relname))
      )
      ORDER BY pg_total_relation_size(format('%I.%I', n.nspname, c.relname)) DESC
    ), '[]'::jsonb
  ) INTO tables
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r';

  RETURN jsonb_build_object(
    'db_size_bytes', db_size_bytes,
    'limit_bytes', limit_bytes,
    'percent_used', ROUND(COALESCE(percent_used, 0), 2),
    'tables', tables
  );
END;
$$;

-- Optional: Restrict execute to authenticated role; function still guards by is_user_admin()
REVOKE ALL ON FUNCTION public.get_db_usage(bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_db_usage(bigint) TO authenticated;