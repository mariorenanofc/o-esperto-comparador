-- Fix UPDATE policy to include WITH CHECK clause (required for upsert)
DROP POLICY IF EXISTS "Users can update their own notification settings" ON notification_settings;

CREATE POLICY "Users can update their own notification settings" 
ON notification_settings FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add DELETE policy for completeness
DROP POLICY IF EXISTS "Users can delete their own notification settings" ON notification_settings;

CREATE POLICY "Users can delete their own notification settings" 
ON notification_settings FOR DELETE 
USING (auth.uid() = user_id);

-- Ensure user_id has UNIQUE constraint for upsert to work correctly
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'notification_settings_user_id_key'
  ) THEN
    ALTER TABLE notification_settings 
    ADD CONSTRAINT notification_settings_user_id_key UNIQUE (user_id);
  END IF;
END $$;