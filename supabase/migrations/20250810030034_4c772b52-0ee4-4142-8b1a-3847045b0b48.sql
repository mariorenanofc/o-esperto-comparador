-- Forçar atualização dos dois usuários para admin baseado nos emails
UPDATE public.profiles 
SET plan = 'admin', updated_at = now()
WHERE email IN ('mariovendasonline10k@gmail.com', 'mariorenan25@gmail.com');

-- Garantir que tenham registros na tabela subscribers com admin
INSERT INTO public.subscribers (user_id, email, subscription_tier, subscribed, created_at, updated_at)
SELECT 
  p.id,
  p.email,
  'admin'::text,
  true,
  now(),
  now()
FROM public.profiles p 
WHERE p.email IN ('mariovendasonline10k@gmail.com', 'mariorenan25@gmail.com')
ON CONFLICT (user_id) DO UPDATE SET
  subscription_tier = 'admin',
  subscribed = true,
  updated_at = now();

-- Atualizar a função de verificação de admin para incluir verificação por email
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (
      plan = 'admin' 
      OR email IN ('mariovendasonline10k@gmail.com', 'mariorenan25@gmail.com')
    )
  );
$function$;

-- Atualizar a função de verificação específica para incluir email
CREATE OR REPLACE FUNCTION public.check_user_admin_status(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT (plan = 'admin' OR email IN ('mariovendasonline10k@gmail.com', 'mariorenan25@gmail.com'))
     FROM public.profiles 
     WHERE id = COALESCE(user_uuid, auth.uid())
     LIMIT 1), 
    false
  );
$function$;

-- Verificar o resultado
SELECT id, email, name, plan FROM public.profiles WHERE email IN ('mariovendasonline10k@gmail.com', 'mariorenan25@gmail.com');