-- Remover constraint que impede 'admin' e corrigir estrutura
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;

-- Criar constraint mais flexível que permite 'admin'
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check 
CHECK (plan IN ('free', 'pro', 'premium', 'admin'));

-- Agora atualizar os usuários para admin
UPDATE public.profiles 
SET plan = 'admin' 
WHERE id IN ('bded2150-509c-4d02-a8fc-2c45977a3b13', '2e83f998-48e4-4b71-ae39-3118b42a3e51');