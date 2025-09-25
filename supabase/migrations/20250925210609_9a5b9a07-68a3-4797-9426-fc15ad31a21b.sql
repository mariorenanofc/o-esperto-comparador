-- Fix Security Warning: Move extensions from public schema to extensions schema
-- This addresses SUPA_extension_in_public warning

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_trgm extension to extensions schema
-- First drop from public if it exists there
DROP EXTENSION IF EXISTS pg_trgm;

-- Create in extensions schema
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- Update search function to use extensions schema
CREATE OR REPLACE FUNCTION public.search_products_optimized(search_term text DEFAULT NULL::text, category_filter text DEFAULT NULL::text, limit_count integer DEFAULT 100)
RETURNS TABLE(id uuid, name text, category text, unit text, quantity integer, created_at timestamp with time zone, similarity_score real)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  IF search_term IS NOT NULL AND LENGTH(TRIM(search_term)) > 0 THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.name,
      p.category,
      p.unit,
      p.quantity,
      p.created_at,
      extensions.SIMILARITY(p.name, search_term) as similarity_score
    FROM products p
    WHERE 
      (category_filter IS NULL OR p.category = category_filter)
      AND (
        p.name ILIKE ('%' || search_term || '%') 
        OR extensions.SIMILARITY(p.name, search_term) > 0.3
      )
    ORDER BY 
      extensions.SIMILARITY(p.name, search_term) DESC,
      p.name ASC
    LIMIT limit_count;
  ELSE
    RETURN QUERY
    SELECT 
      p.id,
      p.name,
      p.category,
      p.unit,
      p.quantity,
      p.created_at,
      0.0 as similarity_score
    FROM products p
    WHERE (category_filter IS NULL OR p.category = category_filter)
    ORDER BY p.name ASC
    LIMIT limit_count;
  END IF;
END;
$function$;

-- Enhanced security function to log critical security events
CREATE OR REPLACE FUNCTION public.log_critical_security_event(event_type text, severity text DEFAULT 'critical'::text, details jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log critical security events with enhanced details
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_user_id,
    details
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'CRITICAL_SECURITY_EVENT',
    NULL,
    jsonb_build_object(
      'event_type', event_type,
      'severity', severity,
      'timestamp', now(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
      'session_info', jsonb_build_object(
        'auth_uid', auth.uid(),
        'current_user', current_user,
        'current_setting_role', current_setting('role', true)
      ),
      'details', details
    )
  );
END;
$function$;

-- Enhanced admin verification with logging
CREATE OR REPLACE FUNCTION public.verify_admin_with_logging(operation_type text DEFAULT 'general')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_admin_user boolean;
BEGIN
  -- Check if user is admin
  is_admin_user := public.is_user_admin();
  
  -- Log admin operations for security audit
  IF is_admin_user THEN
    PERFORM public.log_security_event(
      'ADMIN_OPERATION_VERIFIED',
      'info',
      jsonb_build_object(
        'operation_type', operation_type,
        'admin_user_id', auth.uid()
      )
    );
  ELSE
    -- Log failed admin verification attempts
    PERFORM public.log_critical_security_event(
      'ADMIN_ACCESS_DENIED',
      'warning',
      jsonb_build_object(
        'operation_type', operation_type,
        'attempted_user_id', auth.uid(),
        'reason', 'insufficient_privileges'
      )
    );
  END IF;
  
  RETURN is_admin_user;
END;
$function$;

-- Create function to mask sensitive profile data for better privacy
CREATE OR REPLACE FUNCTION public.get_masked_profile_data(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  profile_data jsonb;
  is_admin boolean;
  is_own_profile boolean;
BEGIN
  is_admin := public.is_user_admin();
  is_own_profile := (auth.uid() = target_user_id);
  
  -- Only allow access to own profile or admin access
  IF NOT (is_admin OR is_own_profile) THEN
    RAISE EXCEPTION 'Insufficient privileges to access profile data' USING ERRCODE = '42501';
  END IF;
  
  SELECT jsonb_build_object(
    'id', p.id,
    'name', p.name,
    'email', CASE 
      WHEN is_own_profile OR is_admin THEN p.email
      ELSE public.mask_sensitive_admin_data(p.email)
    END,
    'plan', p.plan,
    'created_at', p.created_at,
    'is_online', p.is_online,
    'last_activity', CASE
      WHEN is_own_profile OR is_admin THEN p.last_activity
      ELSE NULL
    END
  ) INTO profile_data
  FROM public.profiles p
  WHERE p.id = target_user_id;
  
  -- Log profile access for security audit
  PERFORM public.log_security_event(
    'PROFILE_DATA_ACCESS',
    'info',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'accessor_user_id', auth.uid(),
      'is_admin_access', is_admin,
      'is_own_profile', is_own_profile
    )
  );
  
  RETURN profile_data;
END;
$function$;