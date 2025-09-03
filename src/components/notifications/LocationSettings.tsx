import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const LocationSettings: React.FC = () => {
  const { user } = useAuth();
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!city.trim() || !state.trim()) {
      toast.error('Por favor, preencha cidade e estado');
      return;
    }

    try {
      setSaving(true);
      
      await supabase
        .from('notification_settings')
        .upsert({
          user_id: user?.id,
          location_city: city.trim(),
          location_state: state.trim().toUpperCase()
        });

      toast.success('Localização atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Erro ao atualizar localização');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Localização para Ofertas
        </CardTitle>
        <CardDescription>
          Configure sua localização para receber ofertas da sua região
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: São Paulo"
            />
          </div>
          <div>
            <Label htmlFor="state">Estado (UF)</Label>
            <Input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              placeholder="Ex: SP"
              maxLength={2}
            />
          </div>
        </div>
        
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Localização'}
        </Button>
      </CardContent>
    </Card>
  );
};