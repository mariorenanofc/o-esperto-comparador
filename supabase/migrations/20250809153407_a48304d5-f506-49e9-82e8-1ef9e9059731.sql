-- Verificar se há triggers na tabela profiles
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles' 
AND event_object_schema = 'public';

-- Forçar a atualização novamente para ambos administradores
UPDATE public.profiles 
SET plan = 'admin', updated_at = now()
WHERE id IN (
  '2e83f998-48e4-4b71-ae39-3118b42a3e51',
  'b792b54b-80f6-41e9-a31c-64827cd91cbe'
);

-- Verificar se a atualização funcionou
SELECT id, email, name, plan, created_at, updated_at 
FROM public.profiles 
WHERE id IN (
  '2e83f998-48e4-4b71-ae39-3118b42a3e51',
  'b792b54b-80f6-41e9-a31c-64827cd91cbe'
);

-- Verificar se há entradas na tabela subscribers que podem estar interferindo
SELECT user_id, email, subscription_tier, subscribed, created_at, updated_at
FROM public.subscribers 
WHERE user_id IN (
  '2e83f998-48e4-4b71-ae39-3118b42a3e51',
  'b792b54b-80f6-41e9-a31c-64827cd91cbe'
);