-- Criar função para verificar se um usuário é admin baseado no email
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT true 
     FROM auth.users 
     WHERE id = auth.uid()
       AND email IN ('mariorenan25@gmail.com', 'mariovendasonline10k@gmail.com')
     LIMIT 1), 
    false
  );
$$;

-- Atualizar função de verificação de admin por UUID
CREATE OR REPLACE FUNCTION public.check_user_admin_status(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT true 
     FROM auth.users 
     WHERE id = COALESCE(user_uuid, auth.uid())
       AND email IN ('mariorenan25@gmail.com', 'mariovendasonline10k@gmail.com')
     LIMIT 1), 
    false
  );
$$;

-- Função para garantir que admins tenham plano 'admin' automaticamente
CREATE OR REPLACE FUNCTION public.ensure_admin_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Se o email é de admin, garantir que o plano seja 'admin'
  IF NEW.email IN ('mariorenan25@gmail.com', 'mariovendasonline10k@gmail.com') THEN
    NEW.plan := 'admin';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para garantir que admins sempre tenham plano correto
DROP TRIGGER IF EXISTS ensure_admin_profile_trigger ON public.profiles;
CREATE TRIGGER ensure_admin_profile_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_admin_profile();

-- Atualizar perfis existentes para os admins
UPDATE public.profiles 
SET plan = 'admin', updated_at = now()
WHERE email IN ('mariorenan25@gmail.com', 'mariovendasonline10k@gmail.com');

-- Função para verificar acesso ilimitado de funcionalidades para admins
CREATE OR REPLACE FUNCTION public.check_user_feature_access(feature_name text, current_usage integer DEFAULT 0)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_plan TEXT;
  plan_limits JSONB;
BEGIN
  -- Verificar se é admin primeiro (acesso ilimitado)
  IF public.is_user_admin() THEN
    RETURN TRUE;
  END IF;
  
  -- Buscar o plano do usuário
  SELECT plan INTO user_plan
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- Se não encontrou o usuário ou plano, assume free
  IF user_plan IS NULL THEN
    user_plan := 'free';
  END IF;
  
  -- Definir limites por plano
  plan_limits := CASE user_plan
    WHEN 'free' THEN '{
      "comparisonsPerMonth": 2,
      "savedComparisons": 1,
      "reportsHistory": 0,
      "priceAlerts": 0,
      "maxStoresPerComparison": 4,
      "maxProductsPerComparison": 8,
      "dailyOffersVisible": 2
    }'::jsonb
    WHEN 'premium' THEN '{
      "comparisonsPerMonth": 10,
      "savedComparisons": 5,
      "reportsHistory": 6,
      "priceAlerts": 5,
      "maxStoresPerComparison": 10,
      "maxProductsPerComparison": 20,
      "dailyOffersVisible": -1
    }'::jsonb
    WHEN 'pro' THEN '{
      "comparisonsPerMonth": -1,
      "savedComparisons": 12,
      "reportsHistory": -1,
      "priceAlerts": -1,
      "maxStoresPerComparison": -1,
      "maxProductsPerComparison": -1,
      "dailyOffersVisible": -1
    }'::jsonb
    ELSE '{
      "comparisonsPerMonth": 2,
      "savedComparisons": 1,
      "reportsHistory": 0,
      "priceAlerts": 0,
      "maxStoresPerComparison": 4,
      "maxProductsPerComparison": 8,
      "dailyOffersVisible": 2
    }'::jsonb
  END;
  
  -- Verificar o limite específico
  DECLARE
    feature_limit INTEGER;
  BEGIN
    feature_limit := (plan_limits ->> feature_name)::INTEGER;
    
    -- -1 significa ilimitado
    IF feature_limit = -1 THEN
      RETURN TRUE;
    END IF;
    
    -- Verificar se o uso atual está dentro do limite
    RETURN current_usage < feature_limit;
  END;
END;
$$;