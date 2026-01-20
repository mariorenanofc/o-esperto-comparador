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
  location_city?: string;
  location_state?: string;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  offers_enabled: boolean;
  subscription_reminders_enabled: boolean;
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
  location_city: '',
  location_state: '',
  quiet_hours_enabled: true,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
  offers_enabled: true,
  subscription_reminders_enabled: true,
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
          location_city: data.location_city || '',
          location_state: data.location_state || '',
          quiet_hours_enabled: data.quiet_hours_enabled ?? true,
          quiet_hours_start: data.quiet_hours_start?.substring(0, 5) || '22:00',
          quiet_hours_end: data.quiet_hours_end?.substring(0, 5) || '08:00',
          offers_enabled: data.offers_enabled ?? true,
          subscription_reminders_enabled: data.subscription_reminders_enabled ?? true,
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
    if (!user?.id) {
      throw new Error('Usuário não autenticado. Faça login novamente.');
    }

    const previousSettings = { ...settings };
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          push_enabled: updatedSettings.push_enabled,
          email_enabled: updatedSettings.email_enabled,
          sound_enabled: updatedSettings.sound_enabled,
          desktop_enabled: updatedSettings.desktop_enabled,
          contributions_enabled: updatedSettings.contributions_enabled,
          suggestions_enabled: updatedSettings.suggestions_enabled,
          admin_notifications_enabled: updatedSettings.admin_notifications_enabled,
          marketing_enabled: updatedSettings.marketing_enabled,
          location_city: updatedSettings.location_city || null,
          location_state: updatedSettings.location_state || null,
          quiet_hours_enabled: updatedSettings.quiet_hours_enabled,
          quiet_hours_start: updatedSettings.quiet_hours_start,
          quiet_hours_end: updatedSettings.quiet_hours_end,
          offers_enabled: updatedSettings.offers_enabled,
          subscription_reminders_enabled: updatedSettings.subscription_reminders_enabled,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Supabase upsert error:', error.message, error.code, error.details);
        throw new Error(`Erro ao salvar: ${error.message}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      // Reverter em caso de erro
      setSettings(previousSettings);
      throw error;
    }
  };

  const isNotificationTypeEnabled = (type: string): boolean => {
    const booleanSettings = [
      'push_enabled', 'email_enabled', 'sound_enabled', 'desktop_enabled',
      'contributions_enabled', 'suggestions_enabled', 'admin_notifications_enabled', 
      'marketing_enabled', 'quiet_hours_enabled', 'offers_enabled', 'subscription_reminders_enabled'
    ];
    
    if (booleanSettings.includes(type)) {
      return settings[type as keyof NotificationSettings] as boolean;
    }
    
    return false;
  };

  const updateLocation = async (city: string, state: string) => {
    await updateSettings({
      location_city: city,
      location_state: state
    });

    // Also update push subscriptions with location
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .update({
          location_city: city,
          location_state: state
        })
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error updating push subscription location:', error);
      }
    } catch (error) {
      console.error('Error updating push subscription location:', error);
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    updateLocation,
    isNotificationTypeEnabled,
    loadSettings
  };
};