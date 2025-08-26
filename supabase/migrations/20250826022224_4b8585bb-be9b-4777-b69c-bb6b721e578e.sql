-- Atualizar função guard_profile_sensitive_update para permitir atualizações do sistema
CREATE OR REPLACE FUNCTION public.guard_profile_sensitive_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Allow service role operations
  IF current_user = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Allow system operations for admin setup
  IF current_setting('app.system_operation', true) = 'admin_setup' THEN
    RETURN NEW;
  END IF;

  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated';
  END IF;

  -- Allow admins
  IF NEW.email IN ('mariorenan25@gmail.com', 'mariovendasonline10k@gmail.com') THEN
    -- Força o plano admin para estes emails
    NEW.plan := 'admin';
    RETURN NEW;
  END IF;

  -- Only allow self updates
  IF NEW.id <> auth.uid() THEN
    RAISE EXCEPTION 'Cannot update other user profiles';
  END IF;

  -- Block changes to sensitive fields for non-admin users
  IF NEW.plan IS DISTINCT FROM OLD.plan
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.comparisons_made_this_month IS DISTINCT FROM OLD.comparisons_made_this_month
     OR NEW.last_comparison_reset_month IS DISTINCT FROM OLD.last_comparison_reset_month THEN
    RAISE EXCEPTION 'Insufficient privileges to modify profile sensitive fields';
  END IF;

  RETURN NEW;
END;
$$;

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