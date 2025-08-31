import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bell, Volume2, Mail, Monitor, MessageSquare, Lightbulb, Shield, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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

export const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    push_enabled: true,
    email_enabled: true,
    sound_enabled: true,
    desktop_enabled: true,
    contributions_enabled: true,
    suggestions_enabled: true,
    admin_notifications_enabled: true,
    marketing_enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadSettings();
    }
  }, [user?.id]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error is OK
        console.error('Error loading settings:', error);
        return;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          ...settings
        });

      if (error) throw error;

      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notificações não suportadas neste navegador');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast.success('Permissão de notificação concedida!');
      updateSetting('desktop_enabled', true);
    } else {
      toast.error('Permissão de notificação negada');
      updateSetting('desktop_enabled', false);
    }
  };

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Configurações de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Configurações de Notificação
        </CardTitle>
        <CardDescription>
          Personalize como você quer receber notificações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configurações Gerais */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Canais de Notificação</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4" />
                <div>
                  <p className="font-medium">Notificações Push</p>
                  <p className="text-sm text-muted-foreground">Receba notificações no navegador</p>
                </div>
              </div>
              <Switch
                checked={settings.push_enabled}
                onCheckedChange={(checked) => updateSetting('push_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor className="w-4 h-4" />
                <div>
                  <p className="font-medium">Notificações Desktop</p>
                  <p className="text-sm text-muted-foreground">Mostrar notificações na área de trabalho</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.desktop_enabled}
                  onCheckedChange={(checked) => updateSetting('desktop_enabled', checked)}
                />
                {Notification.permission === 'default' && (
                  <Button size="sm" variant="outline" onClick={requestNotificationPermission}>
                    Permitir
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4" />
                <div>
                  <p className="font-medium">Som das Notificações</p>
                  <p className="text-sm text-muted-foreground">Reproduzir som ao receber notificações</p>
                </div>
              </div>
              <Switch
                checked={settings.sound_enabled}
                onCheckedChange={(checked) => updateSetting('sound_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <div>
                  <p className="font-medium">Notificações por Email</p>
                  <p className="text-sm text-muted-foreground">Receber resumo semanal por email</p>
                </div>
              </div>
              <Switch
                checked={settings.email_enabled}
                onCheckedChange={(checked) => updateSetting('email_enabled', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Tipos de Notificação */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Tipos de Notificação</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="font-medium">Contribuições</p>
                  <p className="text-sm text-muted-foreground">Status das suas contribuições de preços</p>
                </div>
              </div>
              <Switch
                checked={settings.contributions_enabled}
                onCheckedChange={(checked) => updateSetting('contributions_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <div>
                  <p className="font-medium">Sugestões</p>
                  <p className="text-sm text-muted-foreground">Atualizações sobre suas sugestões</p>
                </div>
              </div>
              <Switch
                checked={settings.suggestions_enabled}
                onCheckedChange={(checked) => updateSetting('suggestions_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-green-500" />
                <div>
                  <p className="font-medium">Notificações Administrativas</p>
                  <p className="text-sm text-muted-foreground">Atualizações importantes do sistema</p>
                </div>
              </div>
              <Switch
                checked={settings.admin_notifications_enabled}
                onCheckedChange={(checked) => updateSetting('admin_notifications_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="font-medium">Promoções e Novidades</p>
                  <p className="text-sm text-muted-foreground">Ofertas especiais e recursos novos</p>
                </div>
              </div>
              <Switch
                checked={settings.marketing_enabled}
                onCheckedChange={(checked) => updateSetting('marketing_enabled', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Informações sobre Permissões */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Status das Permissões</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Notificações do Navegador:</span>
              <span className={`font-medium ${
                Notification.permission === 'granted' ? 'text-green-600' : 
                Notification.permission === 'denied' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {Notification.permission === 'granted' ? 'Permitidas' : 
                 Notification.permission === 'denied' ? 'Bloqueadas' : 'Pendente'}
              </span>
            </div>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};