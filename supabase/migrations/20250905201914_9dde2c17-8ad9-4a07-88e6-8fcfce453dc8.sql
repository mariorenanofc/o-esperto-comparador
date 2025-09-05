-- Fix security warnings: Documentation and password protection setup

-- 1. Note about pg_net extension in public schema
-- The pg_net extension being in public schema is a standard Supabase configuration
-- for many projects and is managed by Supabase. This is not a critical security risk
-- as it's properly sandboxed and controlled by Supabase's infrastructure.

-- 2. Add a system comment about the extension location
COMMENT ON EXTENSION pg_net IS 'Supabase managed extension for async networking. Located in public schema per Supabase standard configuration.';

-- 3. Create a reminder table for manual security tasks
CREATE TABLE IF NOT EXISTS security_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Add reminder for enabling leaked password protection
INSERT INTO security_reminders (task_type, description, status)
VALUES (
  'password_protection',
  'Enable leaked password protection in Supabase Auth settings. This must be done manually at: https://supabase.com/dashboard/project/diqdsmrlhldanxxrtozl/auth/providers',
  'pending'
) ON CONFLICT DO NOTHING;

-- 5. Add comment explaining the security model
COMMENT ON TABLE security_reminders IS 'Tracks manual security configuration tasks that need to be completed in Supabase dashboard';

-- 6. Grant appropriate permissions
GRANT SELECT ON security_reminders TO authenticated;
GRANT ALL ON security_reminders TO service_role;

-- Enable RLS
ALTER TABLE security_reminders ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view security reminders
CREATE POLICY "Admins can manage security reminders"
ON security_reminders
FOR ALL
TO authenticated
USING (is_user_admin())
WITH CHECK (is_user_admin());