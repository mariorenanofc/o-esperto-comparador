
-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Adicionar campos para controle de usuários ativos
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- Criar função para atualizar última atividade
CREATE OR REPLACE FUNCTION public.update_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET last_activity = now(), is_online = true 
  WHERE id = auth.uid();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para atualizar atividade em operações de usuário
DROP TRIGGER IF EXISTS update_activity_trigger ON public.comparisons;
CREATE TRIGGER update_activity_trigger
  AFTER INSERT OR UPDATE ON public.comparisons
  FOR EACH ROW EXECUTE FUNCTION public.update_user_activity();

DROP TRIGGER IF EXISTS update_activity_suggestions_trigger ON public.suggestions;
CREATE TRIGGER update_activity_suggestions_trigger
  AFTER INSERT OR UPDATE ON public.suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_activity();

-- Criar política RLS para permitir que admins vejam todos os perfis
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND plan = 'admin'
    )
  );

-- Política para permitir que usuários atualizem sua própria atividade
DROP POLICY IF EXISTS "Users can update own activity" ON public.profiles;
CREATE POLICY "Users can update own activity" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Permitir que admins atualizem status de sugestões
DROP POLICY IF EXISTS "Admins can update suggestions" ON public.suggestions;
CREATE POLICY "Admins can update suggestions"
  ON public.suggestions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND plan = 'admin'
    )
  );

-- Permitir que admins vejam todas as sugestões
DROP POLICY IF EXISTS "Admins can view all suggestions" ON public.suggestions;
CREATE POLICY "Admins can view all suggestions"
  ON public.suggestions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND plan = 'admin'
    )
  );

-- Permitir que admins gerenciem daily_offers
DROP POLICY IF EXISTS "Admins can update daily offers" ON public.daily_offers;
CREATE POLICY "Admins can update daily offers"
  ON public.daily_offers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND plan = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete daily offers" ON public.daily_offers;
CREATE POLICY "Admins can delete daily offers"
  ON public.daily_offers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND plan = 'admin'
    )
  );

-- Criar job cron para limpeza automática diária (executa à meia-noite)
SELECT cron.schedule(
  'daily-cleanup-contributions',
  '0 0 * * *', -- Todo dia à meia-noite
  $$
  DELETE FROM public.daily_offers 
  WHERE created_at < (now() - interval '1 day') 
    AND verified = false;
  $$
);

-- Função para marcar usuários como offline após inatividade
CREATE OR REPLACE FUNCTION public.mark_inactive_users_offline()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET is_online = false 
  WHERE last_activity < (now() - interval '30 minutes');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Job cron para marcar usuários inativos como offline (executa a cada 15 minutos)
SELECT cron.schedule(
  'mark-users-offline',
  '*/15 * * * *', -- A cada 15 minutos
  'SELECT public.mark_inactive_users_offline();'
);
