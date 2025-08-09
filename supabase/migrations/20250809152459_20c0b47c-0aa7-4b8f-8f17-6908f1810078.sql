-- Definir os dois usuários como administradores principais
UPDATE public.profiles 
SET plan = 'admin', updated_at = now()
WHERE id IN (
  '2e83f998-48e4-4b71-ae39-3118b42a3e51',
  'b792b54b-80f6-41e9-a31c-64827cd91cbe'
);

-- Se os perfis não existirem, criar eles como admin
INSERT INTO public.profiles (id, plan, created_at, updated_at)
SELECT user_id, 'admin', now(), now()
FROM (
  VALUES 
    ('2e83f998-48e4-4b71-ae39-3118b42a3e51'::uuid),
    ('b792b54b-80f6-41e9-a31c-64827cd91cbe'::uuid)
) AS admin_users(user_id)
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = admin_users.user_id
);

-- Confirmar que os usuários foram definidos como admin
SELECT id, plan, created_at, updated_at 
FROM public.profiles 
WHERE id IN (
  '2e83f998-48e4-4b71-ae39-3118b42a3e51',
  'b792b54b-80f6-41e9-a31c-64827cd91cbe'
);