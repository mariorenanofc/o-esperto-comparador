
-- Criar uma função security definer para verificar se o usuário é admin
-- Isso evita recursão infinita nas políticas RLS
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND plan = 'admin'
  );
$$;

-- Recriar as políticas problemáticas usando a nova função
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.is_user_admin());

DROP POLICY IF EXISTS "Admins can view all suggestions" ON public.suggestions;
CREATE POLICY "Admins can view all suggestions"
  ON public.suggestions
  FOR SELECT
  USING (public.is_user_admin());

DROP POLICY IF EXISTS "Admins can update suggestions" ON public.suggestions;
CREATE POLICY "Admins can update suggestions"
  ON public.suggestions
  FOR UPDATE
  USING (public.is_user_admin());

DROP POLICY IF EXISTS "Admins can update daily offers" ON public.daily_offers;
CREATE POLICY "Admins can update daily offers"
  ON public.daily_offers
  FOR UPDATE
  USING (public.is_user_admin());

DROP POLICY IF EXISTS "Admins can delete daily offers" ON public.daily_offers;
CREATE POLICY "Admins can delete daily offers"
  ON public.daily_offers
  FOR DELETE
  USING (public.is_user_admin());
