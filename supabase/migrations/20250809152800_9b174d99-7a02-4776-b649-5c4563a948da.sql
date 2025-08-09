-- Criar uma função auxiliar para verificar admin
CREATE OR REPLACE FUNCTION public.check_user_admin_status(user_uuid uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT COALESCE(
    (SELECT plan = 'admin' 
     FROM public.profiles 
     WHERE id = COALESCE(user_uuid, auth.uid())
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

-- Verificar se a função está funcionando para os admins
SELECT 
  id,
  email,
  plan,
  public.check_user_admin_status(id) as is_admin_check
FROM public.profiles 
WHERE id IN (
  '2e83f998-48e4-4b71-ae39-3118b42a3e51',
  'b792b54b-80f6-41e9-a31c-64827cd91cbe'
);