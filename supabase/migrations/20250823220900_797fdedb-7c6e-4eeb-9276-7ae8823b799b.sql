-- Ajustar search_path nas funções criadas
ALTER FUNCTION public.validate_product_data() SET search_path = 'public';
ALTER FUNCTION public.cleanup_orphaned_data() SET search_path = 'public';