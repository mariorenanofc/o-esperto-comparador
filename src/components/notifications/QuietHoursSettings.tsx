import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Moon, Sun, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface QuietHoursSettingsProps {
  className?: string;
}

export const QuietHoursSettings: React.FC<QuietHoursSettingsProps> = ({
  className
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [startTime, setStartTime] = useState('22:00');
  const [endTime, setEndTime] = useState('08:00');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('quiet_hours_enabled, quiet_hours_start, quiet_hours_end')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading quiet hours settings:', error);
        return;
      }

      if (data) {
        setQuietHoursEnabled(data.quiet_hours_enabled || false);
        setStartTime(data.quiet_hours_start || '22:00');
        setEndTime(data.quiet_hours_end || '08:00');
      }
    } catch (error) {
      console.error('Error in loadSettings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          quiet_hours_enabled: quietHoursEnabled,
          quiet_hours_start: startTime,
          quiet_hours_end: endTime,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Configurações salvas",
        description: "Horários de silêncio foram atualizados com sucesso"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const isQuietTime = () => {
    if (!quietHoursEnabled) return false;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Handle quiet hours that cross midnight
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Horários de Silêncio
          {isQuietTime() && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Moon className="h-3 w-3" />
              Ativo
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="quiet-hours-toggle">Ativar horários de silêncio</Label>
            <p className="text-sm text-muted-foreground">
              Não receber notificações durante os horários configurados
            </p>
          </div>
          <Switch
            id="quiet-hours-toggle"
            checked={quietHoursEnabled}
            onCheckedChange={setQuietHoursEnabled}
          />
        </div>

        {quietHoursEnabled && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time" className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Início
                </Label>
                <input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  {formatTimeDisplay(startTime)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time" className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Fim
                </Label>
                <input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  {formatTimeDisplay(endTime)}
                </p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {startTime > endTime 
                  ? `Horário de silêncio das ${formatTimeDisplay(startTime)} às ${formatTimeDisplay(endTime)} (cruzando meia-noite)`
                  : `Horário de silêncio das ${formatTimeDisplay(startTime)} às ${formatTimeDisplay(endTime)}`
                }
              </AlertDescription>
            </Alert>

            {isQuietTime() && (
              <Alert>
                <Moon className="h-4 w-4" />
                <AlertDescription>
                  Você está atualmente no horário de silêncio. Notificações estão pausadas.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        <Button 
          onClick={saveSettings}
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </CardContent>
    </Card>
  );
};