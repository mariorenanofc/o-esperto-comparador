-- Primeiro, vamos atualizar a tabela subscribers para os administradores
UPDATE public.subscribers 
SET subscription_tier = 'admin', updated_at = now()
WHERE user_id IN (
  '2e83f998-48e4-4b71-ae39-3118b42a3e51',
  'b792b54b-80f6-41e9-a31c-64827cd91cbe'
);

-- Se não existirem registros, criar eles
INSERT INTO public.subscribers (user_id, email, subscription_tier, subscribed, created_at, updated_at)
SELECT user_id, email, 'admin', true, now(), now()
FROM (
  VALUES 
    ('2e83f998-48e4-4b71-ae39-3118b42a3e51'::uuid, 'mariorenan25@gmail.com'),
    ('b792b54b-80f6-41e9-a31c-64827cd91cbe'::uuid, 'mariovendasonline10k@gmail.com')
) AS admin_users(user_id, email)
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscribers WHERE user_id = admin_users.user_id
)
ON CONFLICT (user_id) DO UPDATE SET
  subscription_tier = 'admin',
  subscribed = true,
  updated_at = now();

-- Agora forçar o trigger para sincronizar os profiles
UPDATE public.profiles 
SET plan = 'admin', updated_at = now()
WHERE id IN (
  '2e83f998-48e4-4b71-ae39-3118b42a3e51',
  'b792b54b-80f6-41e9-a31c-64827cd91cbe'
);

-- Verificar se tudo está correto
SELECT 
  p.id, 
  p.email, 
  p.name, 
  p.plan,
  s.subscription_tier,
  s.subscribed
FROM public.profiles p
LEFT JOIN public.subscribers s ON p.id = s.user_id
WHERE p.id IN (
  '2e83f998-48e4-4b71-ae39-3118b42a3e51',
  'b792b54b-80f6-41e9-a31c-64827cd91cbe'
);