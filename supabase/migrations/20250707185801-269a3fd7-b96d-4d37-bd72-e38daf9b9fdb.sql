
-- Verificar se a tabela daily_offers existe e tem as colunas necessárias
-- Se não existir, criar a tabela
CREATE TABLE IF NOT EXISTS public.daily_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  store_name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  contributor_name TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  quantity INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'unidade',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela daily_offers
ALTER TABLE public.daily_offers ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam todas as ofertas aprovadas
CREATE POLICY IF NOT EXISTS "Users can view verified offers" ON public.daily_offers
  FOR SELECT USING (verified = true);

-- Política para permitir que usuários vejam suas próprias contribuições
CREATE POLICY IF NOT EXISTS "Users can view own contributions" ON public.daily_offers
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários criem suas próprias contribuições
CREATE POLICY IF NOT EXISTS "Users can create contributions" ON public.daily_offers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem suas próprias contribuições
CREATE POLICY IF NOT EXISTS "Users can update own contributions" ON public.daily_offers
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir que admins vejam e modifiquem tudo
CREATE POLICY IF NOT EXISTS "Admins can manage all offers" ON public.daily_offers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND plan = 'admin'
    )
  );

-- Verificar se a tabela suggestions existe e tem as colunas necessárias
-- Se não existir, criar a tabela
CREATE TABLE IF NOT EXISTS public.suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('improvement', 'feature', 'bug', 'other')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-review', 'implemented', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela suggestions
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam suas próprias sugestões
CREATE POLICY IF NOT EXISTS "Users can view own suggestions" ON public.suggestions
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários criem suas próprias sugestões
CREATE POLICY IF NOT EXISTS "Users can create suggestions" ON public.suggestions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que admins vejam e modifiquem todas as sugestões
CREATE POLICY IF NOT EXISTS "Admins can manage all suggestions" ON public.suggestions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND plan = 'admin'
    )
  );

-- Função para atualizar o timestamp de updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para daily_offers
DROP TRIGGER IF EXISTS update_daily_offers_updated_at ON public.daily_offers;
CREATE TRIGGER update_daily_offers_updated_at
    BEFORE UPDATE ON public.daily_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para suggestions
DROP TRIGGER IF EXISTS update_suggestions_updated_at ON public.suggestions;
CREATE TRIGGER update_suggestions_updated_at
    BEFORE UPDATE ON public.suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
