-- Verificar e corrigir a função is_user_admin() para ser mais robusta
DROP FUNCTION IF EXISTS public.is_user_admin();

CREATE OR REPLACE FUNCTION public.is_user_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT COALESCE(
    (SELECT plan = 'admin' 
     FROM public.profiles 
     WHERE id = auth.uid() 
     LIMIT 1), 
    false
  );
$function$;

-- Verificar se os administradores estão corretamente configurados
SELECT id, email, name, plan, created_at, updated_at 
FROM public.profiles 
WHERE id IN (
  '2e83f998-48e4-4b71-ae39-3118b42a3e51',
  'b792b54b-80f6-41e9-a31c-64827cd91cbe'
);