import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, Volume2, Mail, Monitor, MessageSquare, Lightbulb, Shield, Gift, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const { settings, loading, updateSettings, updateLocation, isNotificationTypeEnabled } = useNotificationSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const saveSettings = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      await updateSettings(localSettings);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const updateLocalSetting = <K extends keyof typeof localSettings>(key: K, value: typeof localSettings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notificações não suportadas neste navegador');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast.success('Permissão de notificação concedida!');
      updateLocalSetting('desktop_enabled', true);
    } else {
      toast.error('Permissão de notificação negada');
      updateLocalSetting('desktop_enabled', false);
    }
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
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
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Configurações de Notificação
        </CardTitle>
        <CardDescription>
          Personalize como e quando você quer receber notificações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Localização */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Localização para Ofertas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location_city">Cidade</Label>
              <Input
                id="location_city"
                value={localSettings.location_city || ''}
                onChange={(e) => updateLocalSetting('location_city', e.target.value)}
                placeholder="Ex: São Paulo"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="location_state">Estado (UF)</Label>
              <Input
                id="location_state"
                value={localSettings.location_state || ''}
                onChange={(e) => updateLocalSetting('location_state', e.target.value.toUpperCase())}
                placeholder="Ex: SP"
                maxLength={2}
                className="mt-1"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Configure sua localização para receber ofertas da sua região
          </p>
        </div>

        <Separator />

        {/* Horário Silencioso */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Horário Silencioso
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Ativar Horário Silencioso</p>
                <p className="text-sm text-muted-foreground">Não receber notificações durante período específico</p>
              </div>
              <Switch
                checked={localSettings.quiet_hours_enabled}
                onCheckedChange={(checked) => updateLocalSetting('quiet_hours_enabled', checked)}
              />
            </div>
            
            {localSettings.quiet_hours_enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                <div>
                  <Label htmlFor="quiet_start">Início (22:00 padrão)</Label>
                  <Input
                    id="quiet_start"
                    type="time"
                    value={localSettings.quiet_hours_start}
                    onChange={(e) => updateLocalSetting('quiet_hours_start', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="quiet_end">Fim (08:00 padrão)</Label>
                  <Input
                    id="quiet_end"
                    type="time"
                    value={localSettings.quiet_hours_end}
                    onChange={(e) => updateLocalSetting('quiet_hours_end', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Canais de Notificação */}
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
                checked={localSettings.push_enabled}
                onCheckedChange={(checked) => updateLocalSetting('push_enabled', checked)}
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
                  checked={localSettings.desktop_enabled}
                  onCheckedChange={(checked) => updateLocalSetting('desktop_enabled', checked)}
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
                checked={localSettings.sound_enabled}
                onCheckedChange={(checked) => updateLocalSetting('sound_enabled', checked)}
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
                checked={localSettings.email_enabled}
                onCheckedChange={(checked) => updateLocalSetting('email_enabled', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Horário Silencioso - Consolidado aqui */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Horário Silencioso
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Ativar Horário Silencioso</p>
                <p className="text-sm text-muted-foreground">Não receber notificações durante período específico</p>
              </div>
              <Switch
                checked={localSettings.quiet_hours_enabled}
                onCheckedChange={(checked) => updateLocalSetting('quiet_hours_enabled', checked)}
              />
            </div>
            
            {localSettings.quiet_hours_enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                <div>
                  <Label htmlFor="quiet_start">Início (22:00 padrão)</Label>
                  <Input
                    id="quiet_start"
                    type="time"
                    value={localSettings.quiet_hours_start}
                    onChange={(e) => updateLocalSetting('quiet_hours_start', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="quiet_end">Fim (08:00 padrão)</Label>
                  <Input
                    id="quiet_end"
                    type="time"
                    value={localSettings.quiet_hours_end}
                    onChange={(e) => updateLocalSetting('quiet_hours_end', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Tipos de Notificação */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Tipos de Notificação</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="font-medium">Ofertas Especiais</p>
                  <p className="text-sm text-muted-foreground">Ofertas de produtos na sua região</p>
                </div>
              </div>
              <Switch
                checked={localSettings.offers_enabled}
                onCheckedChange={(checked) => updateLocalSetting('offers_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="font-medium">Lembretes de Renovação</p>
                  <p className="text-sm text-muted-foreground">Avisos antes do vencimento da assinatura</p>
                </div>
              </div>
              <Switch
                checked={localSettings.subscription_reminders_enabled}
                onCheckedChange={(checked) => updateLocalSetting('subscription_reminders_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-green-500" />
                <div>
                  <p className="font-medium">Contribuições</p>
                  <p className="text-sm text-muted-foreground">Status das suas contribuições de preços</p>
                </div>
              </div>
              <Switch
                checked={localSettings.contributions_enabled}
                onCheckedChange={(checked) => updateLocalSetting('contributions_enabled', checked)}
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
                checked={localSettings.suggestions_enabled}
                onCheckedChange={(checked) => updateLocalSetting('suggestions_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="font-medium">Notificações Administrativas</p>
                  <p className="text-sm text-muted-foreground">Atualizações importantes do sistema</p>
                </div>
              </div>
              <Switch
                checked={localSettings.admin_notifications_enabled}
                onCheckedChange={(checked) => updateLocalSetting('admin_notifications_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="w-4 h-4 text-pink-500" />
                <div>
                  <p className="font-medium">Marketing e Novidades</p>
                  <p className="text-sm text-muted-foreground">Promoções e recursos novos</p>
                </div>
              </div>
              <Switch
                checked={localSettings.marketing_enabled}
                onCheckedChange={(checked) => updateLocalSetting('marketing_enabled', checked)}
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