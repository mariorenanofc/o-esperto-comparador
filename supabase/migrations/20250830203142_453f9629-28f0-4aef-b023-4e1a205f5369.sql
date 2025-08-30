-- Criar tabela para histórico de pagamentos e assinaturas
CREATE TABLE public.subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id TEXT,
  stripe_subscription_id TEXT,
  stripe_payment_intent_id TEXT,
  plan_type TEXT NOT NULL, -- 'premium' ou 'pro'
  amount_paid INTEGER NOT NULL, -- em centavos
  currency TEXT DEFAULT 'brl',
  payment_status TEXT NOT NULL, -- 'paid', 'pending', 'failed'
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Criar tabela para controle de acesso e limites
CREATE TABLE public.user_access_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_plan TEXT DEFAULT 'free',
  plan_start_date TIMESTAMPTZ,
  plan_end_date TIMESTAMPTZ,
  total_invested NUMERIC DEFAULT 0, -- total investido em reais
  months_subscribed INTEGER DEFAULT 0,
  subscription_count INTEGER DEFAULT 0, -- quantas vezes renovou
  grace_period_days INTEGER DEFAULT 0,
  access_suspended BOOLEAN DEFAULT false,
  suspension_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_payment_date TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ
);

-- Habilitar RLS
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_access_control ENABLE ROW LEVEL SECURITY;

-- Políticas para subscription_history
CREATE POLICY "Admins can view all payment history" 
ON public.subscription_history 
FOR SELECT 
USING (is_user_admin());

CREATE POLICY "Users can view their own payment history" 
ON public.subscription_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert payment history" 
ON public.subscription_history 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update payment history" 
ON public.subscription_history 
FOR UPDATE 
USING (true);

-- Políticas para user_access_control
CREATE POLICY "Admins can view all access control" 
ON public.user_access_control 
FOR ALL 
USING (is_user_admin());

CREATE POLICY "Users can view their own access control" 
ON public.user_access_control 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage access control" 
ON public.user_access_control 
FOR ALL 
USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_subscription_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_access_control_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_history_updated_at_trigger
  BEFORE UPDATE ON public.subscription_history
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_history_updated_at();

CREATE TRIGGER access_control_updated_at_trigger
  BEFORE UPDATE ON public.user_access_control
  FOR EACH ROW
  EXECUTE FUNCTION update_access_control_updated_at();

-- Função para calcular estatísticas de usuário
CREATE OR REPLACE FUNCTION get_user_subscription_stats(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  stats JSONB;
  total_spent NUMERIC := 0;
  months_count INTEGER := 0;
  first_payment DATE;
  last_payment DATE;
BEGIN
  -- Apenas admins podem executar
  IF NOT is_user_admin() THEN
    RAISE EXCEPTION 'Insufficient privileges' USING ERRCODE = '42501';
  END IF;

  -- Calcular estatísticas
  SELECT 
    COALESCE(SUM(amount_paid::NUMERIC / 100), 0) as total,
    COUNT(*) as count,
    MIN(created_at::DATE) as first_pay,
    MAX(created_at::DATE) as last_pay
  INTO total_spent, months_count, first_payment, last_payment
  FROM subscription_history
  WHERE user_id = target_user_id 
    AND payment_status = 'paid';

  stats := jsonb_build_object(
    'total_invested', total_spent,
    'total_payments', months_count,
    'first_payment_date', first_payment,
    'last_payment_date', last_payment,
    'months_as_subscriber', CASE 
      WHEN first_payment IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (COALESCE(last_payment, CURRENT_DATE) - first_payment)) / (30.44 * 24 * 3600)
      ELSE 0 
    END
  );

  RETURN stats;
END;
$$;