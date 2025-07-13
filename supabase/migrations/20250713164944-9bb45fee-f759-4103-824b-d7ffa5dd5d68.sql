
-- Definir os usuários especificados como administradores
UPDATE public.profiles 
SET plan = 'admin' 
WHERE id IN ('bded2150-509c-4d02-a8fc-2c45977a3b13', '2e83f998-48e4-4b71-ae39-3118b42a3e51');

-- Verificar se os usuários existem na tabela profiles, se não existir, criar
INSERT INTO public.profiles (id, email, plan, name)
SELECT 
  u.id,
  u.email,
  'admin',
  COALESCE(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name', u.email)
FROM auth.users u
WHERE u.id IN ('bded2150-509c-4d02-a8fc-2c45977a3b13', '2e83f998-48e4-4b71-ae39-3118b42a3e51')
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO UPDATE SET plan = 'admin';
