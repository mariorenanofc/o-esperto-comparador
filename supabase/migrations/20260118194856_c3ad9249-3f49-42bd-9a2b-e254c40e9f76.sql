-- =====================================================
-- FIX: Corrigir políticas RLS permissivas nas tabelas products, stores, product_prices
-- Problema: WITH CHECK (true) permite qualquer pessoa inserir dados sem validação
-- =====================================================

-- =====================================================
-- 1. TABELA: products
-- =====================================================

-- Remover política permissiva de INSERT
DROP POLICY IF EXISTS "Authenticated users can create products" ON public.products;

-- Criar política restritiva - apenas usuários autenticados podem inserir
CREATE POLICY "Authenticated users can create products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Adicionar política para admins gerenciarem produtos
CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
TO authenticated
USING (is_user_admin())
WITH CHECK (is_user_admin());

-- =====================================================
-- 2. TABELA: stores
-- =====================================================

-- Remover política permissiva de INSERT
DROP POLICY IF EXISTS "Authenticated users can create stores" ON public.stores;

-- Criar política restritiva
CREATE POLICY "Authenticated users can create stores"
ON public.stores
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Adicionar política para admins gerenciarem lojas
CREATE POLICY "Admins can manage stores"
ON public.stores
FOR ALL
TO authenticated
USING (is_user_admin())
WITH CHECK (is_user_admin());

-- =====================================================
-- 3. TABELA: product_prices
-- =====================================================

-- Remover política permissiva de INSERT
DROP POLICY IF EXISTS "Authenticated users can create product prices" ON public.product_prices;

-- Criar política restritiva - vincular a comparação do próprio usuário
CREATE POLICY "Authenticated users can create product prices"
ON public.product_prices
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    comparison_id IS NULL OR
    EXISTS (
      SELECT 1 FROM comparisons 
      WHERE comparisons.id = product_prices.comparison_id 
      AND comparisons.user_id = auth.uid()
    )
  )
);

-- Adicionar política para admins gerenciarem preços
CREATE POLICY "Admins can manage product prices"
ON public.product_prices
FOR ALL
TO authenticated
USING (is_user_admin())
WITH CHECK (is_user_admin());

-- Política para usuários atualizarem preços das próprias comparações
CREATE POLICY "Users can update their own product prices"
ON public.product_prices
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM comparisons 
    WHERE comparisons.id = product_prices.comparison_id 
    AND comparisons.user_id = auth.uid()
  )
);

-- Política para usuários deletarem preços das próprias comparações
CREATE POLICY "Users can delete their own product prices"
ON public.product_prices
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM comparisons 
    WHERE comparisons.id = product_prices.comparison_id 
    AND comparisons.user_id = auth.uid()
  )
);

-- =====================================================
-- Verificar resultado
-- =====================================================
SELECT 'Security Fix Applied: products, stores, product_prices RLS policies corrected' AS status;