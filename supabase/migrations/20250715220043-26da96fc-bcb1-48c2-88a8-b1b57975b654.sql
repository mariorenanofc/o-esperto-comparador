
-- Criar função para limpar ofertas antigas (mais de 24 horas)
CREATE OR REPLACE FUNCTION public.cleanup_old_daily_offers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove ofertas com mais de 24 horas
  DELETE FROM public.daily_offers 
  WHERE created_at < (now() - interval '24 hours');
  
  -- Log da limpeza
  RAISE NOTICE 'Cleaned up offers older than 24 hours';
END;
$$;

-- Criar função que será executada automaticamente antes de consultas
CREATE OR REPLACE FUNCTION public.auto_cleanup_offers()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Executar limpeza automática
  PERFORM public.cleanup_old_daily_offers();
  RETURN NULL;
END;
$$;

-- Criar trigger que executa a limpeza antes de SELECT na tabela daily_offers
CREATE OR REPLACE TRIGGER auto_cleanup_trigger
  BEFORE SELECT ON public.daily_offers
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.auto_cleanup_offers();

-- Executar limpeza imediata para remover dados de teste antigos
SELECT public.cleanup_old_daily_offers();

-- Verificar se há dados antigos restantes
SELECT 
  id, 
  product_name, 
  created_at,
  EXTRACT(EPOCH FROM (now() - created_at))/3600 as hours_old
FROM public.daily_offers 
WHERE created_at < (now() - interval '24 hours')
ORDER BY created_at DESC;
