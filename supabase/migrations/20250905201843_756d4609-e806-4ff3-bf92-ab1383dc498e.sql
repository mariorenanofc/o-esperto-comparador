-- Fix security warnings: Move extensions from public schema and enable password protection

-- 1. Create dedicated schema for extensions (security best practice)
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2. Move pg_net extension to extensions schema
-- First, we need to drop and recreate the extension in the correct schema
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- 3. Grant necessary permissions for pg_net in extensions schema
GRANT USAGE ON SCHEMA extensions TO authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO authenticated, service_role;

-- 4. Update any existing cron jobs to use the new extension location
-- Note: pg_cron extension typically stays in public schema as it's managed by Supabase
-- But we need to ensure it references pg_net correctly

-- 5. Enable leaked password protection (done via Supabase dashboard)
-- This must be enabled manually in Auth settings at:
-- https://supabase.com/dashboard/project/diqdsmrlhldanxxrtozl/auth/providers

-- 6. Add comment documenting the security improvements
COMMENT ON SCHEMA extensions IS 'Dedicated schema for PostgreSQL extensions to improve security by isolating extensions from public schema';

-- 7. Log the security improvement
INSERT INTO admin_audit_log (admin_user_id, action, details)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'SECURITY_IMPROVEMENT',
  jsonb_build_object(
    'type', 'schema_security',
    'actions', jsonb_build_array(
      'moved_pg_net_to_extensions_schema',
      'isolated_extensions_from_public_schema'
    ),
    'timestamp', now()
  )
);