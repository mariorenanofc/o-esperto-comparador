-- =====================================================
-- MIGRAÇÃO DE SEGURANÇA AVANÇADA - VERSÃO CORRIGIDA
-- Implementa auditoria e funções de segurança melhoradas
-- =====================================================

-- 1. FUNÇÃO DE AUDITORIA AVANÇADA (permite NULL para system logs)
CREATE OR REPLACE FUNCTION public.advanced_security_audit(
  event_type text,
  severity text DEFAULT 'medium',
  user_context jsonb DEFAULT '{}',
  system_context jsonb DEFAULT '{}',
  additional_details jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  audit_record jsonb;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Construir registro de auditoria completo
  audit_record := jsonb_build_object(
    'event_type', event_type,
    'severity', severity,
    'timestamp', now(),
    'user_id', current_user_id,
    'session_info', jsonb_build_object(
      'current_user', current_user,
      'current_role', current_setting('role', true),
      'application_name', current_setting('application_name', true)
    ),
    'request_info', jsonb_build_object(
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
      'referer', current_setting('request.headers', true)::jsonb->>'referer'
    ),
    'user_context', user_context,
    'system_context', system_context,
    'additional_details', additional_details
  );

  -- Inserir no log apenas se houver usuário autenticado
  IF current_user_id IS NOT NULL THEN
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      details
    ) VALUES (
      current_user_id,
      'ADVANCED_SECURITY_AUDIT',
      NULL,
      audit_record
    );
  END IF;
END;
$$;

-- 2. FUNÇÃO DE LOGGING DE EVENTOS CRÍTICOS
CREATE OR REPLACE FUNCTION public.log_critical_security_event_enhanced(
  event_type text,
  severity text DEFAULT 'critical',
  threat_level text DEFAULT 'medium',
  details jsonb DEFAULT '{}',
  auto_block boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  enhanced_details jsonb;
BEGIN
  current_user_id := auth.uid();
  
  enhanced_details := jsonb_build_object(
    'event_type', event_type,
    'severity', severity,
    'threat_level', threat_level,
    'timestamp', now(),
    'auto_block_triggered', auto_block,
    'security_context', jsonb_build_object(
      'auth_uid', current_user_id,
      'current_user', current_user,
      'session_id', current_setting('request.jwt.claims', true)::jsonb->>'session_id'
    ),
    'network_context', jsonb_build_object(
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    ),
    'original_details', details
  );

  IF current_user_id IS NOT NULL THEN
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_user_id,
      details
    ) VALUES (
      current_user_id,
      'CRITICAL_SECURITY_EVENT_ENHANCED',
      current_user_id,
      enhanced_details
    );

    IF auto_block THEN
      PERFORM public.log_security_event(
        'AUTO_BLOCK_TRIGGERED',
        'critical',
        jsonb_build_object(
          'original_event', event_type,
          'user_id', current_user_id,
          'block_reason', 'automatic_security_response'
        )
      );
    END IF;
  END IF;
END;
$$;

-- 3. MÁSCARA DE DADOS SENSÍVEIS
CREATE OR REPLACE FUNCTION public.enhanced_mask_sensitive_data(
  data_input jsonb,
  mask_level text DEFAULT 'standard'
)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  key text;
  value jsonb;
  sensitive_keys text[] := ARRAY[
    'email', 'phone', 'cpf', 'cnpj', 'password', 'token', 'key', 'secret',
    'credit_card', 'bank_account', 'stripe_customer_id'
  ];
BEGIN
  IF data_input IS NULL THEN
    RETURN NULL;
  END IF;

  result := '{}';

  FOR key, value IN SELECT * FROM jsonb_each(data_input)
  LOOP
    IF key = ANY(sensitive_keys) OR key ILIKE '%password%' OR key ILIKE '%token%' THEN
      CASE mask_level
        WHEN 'partial' THEN
          IF jsonb_typeof(value) = 'string' AND length(value #>> '{}') > 6 THEN
            result := result || jsonb_build_object(key, left(value #>> '{}', 2) || '***');
          ELSE
            result := result || jsonb_build_object(key, '[MASKED]');
          END IF;
        ELSE
          result := result || jsonb_build_object(key, '[PROTECTED]');
      END CASE;
    ELSE
      IF jsonb_typeof(value) = 'object' THEN
        result := result || jsonb_build_object(key, public.enhanced_mask_sensitive_data(value, mask_level));
      ELSE
        result := result || jsonb_build_object(key, value);
      END IF;
    END IF;
  END LOOP;

  RETURN result;
END;
$$;

-- 4. VERIFICAÇÃO DE ADMIN COM LOGGING
CREATE OR REPLACE FUNCTION public.verify_admin_with_enhanced_logging(
  operation_type text DEFAULT 'general',
  required_permissions text[] DEFAULT '{}',
  log_attempt boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_user boolean;
  current_user_id uuid;
  verification_result jsonb;
BEGIN
  current_user_id := auth.uid();
  is_admin_user := public.is_user_admin();
  
  verification_result := jsonb_build_object(
    'is_admin', is_admin_user,
    'user_id', current_user_id,
    'operation_type', operation_type,
    'verification_time', now()
  );

  IF log_attempt AND current_user_id IS NOT NULL THEN
    IF is_admin_user THEN
      PERFORM public.advanced_security_audit(
        'ADMIN_VERIFICATION_SUCCESS',
        'info',
        jsonb_build_object('admin_user_id', current_user_id),
        jsonb_build_object('operation_type', operation_type),
        jsonb_build_object('verification_result', 'success')
      );
    ELSE
      PERFORM public.log_critical_security_event_enhanced(
        'ADMIN_ACCESS_DENIED',
        'warning',
        'medium',
        jsonb_build_object(
          'operation_type', operation_type,
          'attempted_user_id', current_user_id,
          'reason', 'insufficient_privileges'
        ),
        false
      );
    END IF;
  END IF;

  RETURN verification_result;
END;
$$;

-- 5. DETECÇÃO DE ANOMALIAS
CREATE OR REPLACE FUNCTION public.detect_security_anomalies(
  check_type text DEFAULT 'all'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  anomalies jsonb := '[]';
  recent_failed_logins integer;
BEGIN
  IF NOT public.is_user_admin() THEN
    RAISE EXCEPTION 'Insufficient privileges for security anomaly detection';
  END IF;

  IF check_type IN ('all', 'auth') THEN
    SELECT COUNT(*) INTO recent_failed_logins
    FROM public.admin_audit_log
    WHERE action = 'ADMIN_ACCESS_DENIED'
      AND created_at >= (now() - interval '1 hour');
    
    IF recent_failed_logins > 10 THEN
      anomalies := anomalies || jsonb_build_object(
        'type', 'excessive_failed_logins',
        'severity', 'high',
        'count', recent_failed_logins
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'check_timestamp', now(),
    'anomalies_count', jsonb_array_length(anomalies),
    'anomalies', anomalies
  );
END;
$$;

-- COMENTÁRIOS
COMMENT ON FUNCTION public.advanced_security_audit IS 'Auditoria avançada com contexto completo';
COMMENT ON FUNCTION public.log_critical_security_event_enhanced IS 'Log de eventos críticos com detalhes';
COMMENT ON FUNCTION public.enhanced_mask_sensitive_data IS 'Máscara de dados sensíveis';
COMMENT ON FUNCTION public.verify_admin_with_enhanced_logging IS 'Verificação de admin com logging';
COMMENT ON FUNCTION public.detect_security_anomalies IS 'Detecção de anomalias de segurança';