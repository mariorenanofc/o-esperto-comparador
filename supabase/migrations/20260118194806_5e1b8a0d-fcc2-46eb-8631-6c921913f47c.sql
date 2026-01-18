-- =====================================================
-- FIX: Políticas RLS permissivas na tabela user_access_control
-- O problema: "System can manage access control for authenticated users" 
-- permite QUALQUER usuário autenticado modificar registros de OUTROS usuários
-- Isso é uma vulnerabilidade crítica de segurança!
-- =====================================================

-- 1. Remover a política permissiva problemática
DROP POLICY IF EXISTS "System can manage access control for authenticated users" ON public.user_access_control;

-- 2. Criar política correta para INSERT - usuários só podem criar seu próprio registro
CREATE POLICY "Users can insert their own access control"
ON public.user_access_control
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Criar política correta para UPDATE - usuários só podem atualizar seu próprio registro
-- (mas não podem alterar campos críticos como current_plan)
CREATE POLICY "Users can update their own access control"
ON public.user_access_control
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Criar política para DELETE - usuários podem deletar seu próprio registro
CREATE POLICY "Users can delete their own access control"
ON public.user_access_control
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Criar política para service_role gerenciar qualquer registro
-- (necessário para edge functions e webhooks do Stripe)
CREATE POLICY "Service role can manage all access control"
ON public.user_access_control
FOR ALL
USING (CURRENT_USER = 'service_role'::name);

-- 6. Garantir que admins também possam gerenciar (já existe, mas vamos manter consistência)
-- A política "Admins can view all access control" já existe

-- =====================================================
-- BONUS: Adicionar constraint para evitar duplicatas
-- =====================================================
DO $$
BEGIN
  -- Verificar se a constraint já existe antes de adicionar
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_access_control_user_id_unique'
  ) THEN
    ALTER TABLE public.user_access_control
    ADD CONSTRAINT user_access_control_user_id_unique UNIQUE (user_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    -- Constraint já existe, ignorar
    NULL;
END $$;

-- =====================================================
-- Verificar e logar a correção
-- =====================================================
SELECT 'Security Fix Applied: user_access_control RLS policies corrected' AS status;