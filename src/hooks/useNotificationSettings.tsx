import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface NotificationSettings {
  push_enabled: boolean;
  email_enabled: boolean;
  sound_enabled: boolean;
  desktop_enabled: boolean;
  contributions_enabled: boolean;
  suggestions_enabled: boolean;
  admin_notifications_enabled: boolean;
  marketing_enabled: boolean;
}

const defaultSettings: NotificationSettings = {
  push_enabled: true,
  email_enabled: true,
  sound_enabled: true,
  desktop_enabled: true,
  contributions_enabled: true,
  suggestions_enabled: true,
  admin_notifications_enabled: true,
  marketing_enabled: false,
};

export const useNotificationSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadSettings();
    } else {
      setSettings(defaultSettings);
      setLoading(false);
    }
  }, [user?.id]);

  const loadSettings = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error is OK
        console.error('Error loading notification settings:', error);
        return;
      }

      if (data) {
        setSettings({
          push_enabled: data.push_enabled,
          email_enabled: data.email_enabled,
          sound_enabled: data.sound_enabled,
          desktop_enabled: data.desktop_enabled,
          contributions_enabled: data.contributions_enabled,
          suggestions_enabled: data.suggestions_enabled,
          admin_notifications_enabled: data.admin_notifications_enabled,
          marketing_enabled: data.marketing_enabled,
        });
      } else {
        // Se não existir, criar com valores padrão
        await createDefaultSettings();
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notification_settings')
        .insert({
          user_id: user.id,
          ...defaultSettings
        });

      if (error) {
        console.error('Error creating default settings:', error);
      }
    } catch (error) {
      console.error('Error creating settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (!user?.id) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          ...updatedSettings
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating settings:', error);
      // Reverter em caso de erro
      setSettings(settings);
      throw error;
    }
  };

  const isNotificationTypeEnabled = (type: keyof NotificationSettings): boolean => {
    return settings[type];
  };

  return {
    settings,
    loading,
    updateSettings,
    isNotificationTypeEnabled,
    loadSettings
  };
};