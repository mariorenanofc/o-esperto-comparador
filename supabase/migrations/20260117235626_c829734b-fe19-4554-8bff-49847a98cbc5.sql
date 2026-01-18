-- ===== FASE 2: SISTEMA DE ALERTAS DE PREÇO =====

-- Tabela para alertas de preço dos usuários
CREATE TABLE public.price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  target_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2),
  store_name TEXT,
  city TEXT,
  state TEXT,
  is_active BOOLEAN DEFAULT true,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  triggered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- Policies for price_alerts
CREATE POLICY "Users can view their own price alerts"
ON public.price_alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own price alerts"
ON public.price_alerts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own price alerts"
ON public.price_alerts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price alerts"
ON public.price_alerts FOR DELETE
USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX idx_price_alerts_active ON public.price_alerts(is_active) WHERE is_active = true;
CREATE INDEX idx_price_alerts_product ON public.price_alerts(product_name);

-- ===== FASE 4: LISTA DE COMPRAS INTELIGENTE =====

-- Tabela para listas de compras
CREATE TABLE public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Minha Lista',
  is_active BOOLEAN DEFAULT true,
  total_estimated DECIMAL(10,2) DEFAULT 0,
  total_savings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own shopping lists"
ON public.shopping_lists FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shopping lists"
ON public.shopping_lists FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping lists"
ON public.shopping_lists FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping lists"
ON public.shopping_lists FOR DELETE
USING (auth.uid() = user_id);

-- Tabela para itens da lista de compras
CREATE TABLE public.shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'un',
  category TEXT,
  best_store TEXT,
  best_price DECIMAL(10,2),
  alternative_store TEXT,
  alternative_price DECIMAL(10,2),
  is_checked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Policies (based on parent list ownership)
CREATE POLICY "Users can view their shopping list items"
ON public.shopping_list_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.shopping_lists sl
  WHERE sl.id = shopping_list_items.list_id AND sl.user_id = auth.uid()
));

CREATE POLICY "Users can create shopping list items"
ON public.shopping_list_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.shopping_lists sl
  WHERE sl.id = shopping_list_items.list_id AND sl.user_id = auth.uid()
));

CREATE POLICY "Users can update their shopping list items"
ON public.shopping_list_items FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.shopping_lists sl
  WHERE sl.id = shopping_list_items.list_id AND sl.user_id = auth.uid()
));

CREATE POLICY "Users can delete their shopping list items"
ON public.shopping_list_items FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.shopping_lists sl
  WHERE sl.id = shopping_list_items.list_id AND sl.user_id = auth.uid()
));

-- Indexes
CREATE INDEX idx_shopping_lists_user_id ON public.shopping_lists(user_id);
CREATE INDEX idx_shopping_list_items_list_id ON public.shopping_list_items(list_id);

-- ===== FASE 5: GAMIFICAÇÃO =====

-- Tabela para estatísticas do usuário
CREATE TABLE public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_contributions INTEGER DEFAULT 0,
  total_verified INTEGER DEFAULT 0,
  total_savings_generated DECIMAL(10,2) DEFAULT 0,
  contribution_streak INTEGER DEFAULT 0,
  last_contribution_date DATE,
  xp_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all user stats"
ON public.user_stats FOR SELECT
USING (true);

CREATE POLICY "Users can update their own stats"
ON public.user_stats FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert user stats"
ON public.user_stats FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Tabela para conquistas/badges dos usuários
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view achievements"
ON public.user_achievements FOR SELECT
USING (true);

CREATE POLICY "System can insert achievements"
ON public.user_achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Tabela para cache do leaderboard
CREATE TABLE public.leaderboard_cache (
  id SERIAL PRIMARY KEY,
  period TEXT NOT NULL, -- 'weekly', 'monthly', 'alltime'
  rankings JSONB NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(period)
);

-- Enable RLS
ALTER TABLE public.leaderboard_cache ENABLE ROW LEVEL SECURITY;

-- Everyone can view leaderboard
CREATE POLICY "Anyone can view leaderboard"
ON public.leaderboard_cache FOR SELECT
USING (true);

-- Only admins can update leaderboard
CREATE POLICY "Admins can manage leaderboard"
ON public.leaderboard_cache FOR ALL
USING (is_user_admin());

-- Indexes
CREATE INDEX idx_user_stats_xp ON public.user_stats(xp_points DESC);
CREATE INDEX idx_user_stats_level ON public.user_stats(level DESC);
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_badge ON public.user_achievements(badge_id);

-- Function to update user stats on contribution
CREATE OR REPLACE FUNCTION public.update_user_stats_on_contribution()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id, total_contributions, xp_points, last_contribution_date)
  VALUES (NEW.user_id, 1, 10, CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE SET
    total_contributions = user_stats.total_contributions + 1,
    xp_points = user_stats.xp_points + 10,
    last_contribution_date = CURRENT_DATE,
    contribution_streak = CASE 
      WHEN user_stats.last_contribution_date = CURRENT_DATE - 1 
      THEN user_stats.contribution_streak + 1 
      WHEN user_stats.last_contribution_date = CURRENT_DATE 
      THEN user_stats.contribution_streak
      ELSE 1 
    END,
    level = GREATEST(1, FLOOR(SQRT((user_stats.xp_points + 10) / 100)) + 1)::INTEGER,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para atualizar stats quando uma contribuição é feita
CREATE TRIGGER on_daily_offer_insert
AFTER INSERT ON public.daily_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_user_stats_on_contribution();