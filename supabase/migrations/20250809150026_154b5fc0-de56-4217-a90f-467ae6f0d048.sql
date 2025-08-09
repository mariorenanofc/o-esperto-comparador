-- Melhorias de segurança para o sistema de assinaturas

-- Adicionar trigger para atualizar o plano automaticamente ao alterar subscription_tier
CREATE OR REPLACE FUNCTION sync_profile_plan_from_subscriber()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar o plano no profiles baseado na subscription_tier
  UPDATE public.profiles 
  SET plan = COALESCE(NEW.subscription_tier, 'free'), 
      updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para sincronizar automaticamente
CREATE TRIGGER sync_profile_plan_trigger
  AFTER INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_plan_from_subscriber();

-- Função para verificar se um usuário pode usar uma funcionalidade
CREATE OR REPLACE FUNCTION check_user_feature_access(
  feature_name TEXT,
  current_usage INTEGER DEFAULT 0
) RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
  plan_limits JSONB;
BEGIN
  -- Buscar o plano do usuário
  SELECT plan INTO user_plan
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- Se não encontrou o usuário ou plano, assume free
  IF user_plan IS NULL THEN
    user_plan := 'free';
  END IF;
  
  -- Admin tem acesso ilimitado
  IF user_plan = 'admin' THEN
    RETURN TRUE;
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Política para garantir que usuários só vejam dados baseado no seu plano
CREATE OR REPLACE FUNCTION user_plan_access() 
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT plan FROM public.profiles WHERE id = auth.uid()),
    'free'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Trigger para resetar comparações mensais
CREATE OR REPLACE FUNCTION reset_monthly_comparisons()
RETURNS TRIGGER AS $$
BEGIN
  -- Se mudou o mês, resetar contador
  IF EXTRACT(month FROM now()) != OLD.last_comparison_reset_month THEN
    NEW.comparisons_made_this_month := 0;
    NEW.last_comparison_reset_month := EXTRACT(month FROM now());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para reset automático das comparações
DROP TRIGGER IF EXISTS reset_comparisons_trigger ON public.profiles;
CREATE TRIGGER reset_comparisons_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION reset_monthly_comparisons();