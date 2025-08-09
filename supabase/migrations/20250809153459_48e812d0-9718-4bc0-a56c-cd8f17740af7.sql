-- Primeiro, atualizar os registros existentes na tabela subscribers
UPDATE public.subscribers 
SET subscription_tier = 'admin', subscribed = true, updated_at = now()
WHERE user_id IN (
  '2e83f998-48e4-4b71-ae39-3118b42a3e51',
  'b792b54b-80f6-41e9-a31c-64827cd91cbe'
);

-- Agora atualizar a tabela profiles diretamente
UPDATE public.profiles 
SET plan = 'admin', updated_at = now()
WHERE id IN (
  '2e83f998-48e4-4b71-ae39-3118b42a3e51',
  'b792b54b-80f6-41e9-a31c-64827cd91cbe'
);

-- Verificar se tudo está correto agora
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