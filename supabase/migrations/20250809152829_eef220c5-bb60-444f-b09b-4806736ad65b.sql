-- Corrigir o segundo administrador que ainda está como 'free'
UPDATE public.profiles 
SET plan = 'admin', updated_at = now()
WHERE id = 'b792b54b-80f6-41e9-a31c-64827cd91cbe';

-- Verificar se ambos administradores estão agora com plano 'admin'
SELECT id, email, name, plan, created_at, updated_at 
FROM public.profiles 
WHERE id IN (
  '2e83f998-48e4-4b71-ae39-3118b42a3e51',
  'b792b54b-80f6-41e9-a31c-64827cd91cbe'
);