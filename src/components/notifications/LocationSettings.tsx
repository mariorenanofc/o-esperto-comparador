import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export const LocationSettings: React.FC = () => {
  const { user } = useAuth();
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carregar dados existentes ao montar
  useEffect(() => {
    const loadExistingLocation = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('notification_settings')
          .select('location_city, location_state')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading location:', error);
        } else if (data) {
          setCity(data.location_city || '');
          setState(data.location_state || '');
        }
      } catch (error) {
        console.error('Error loading location:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExistingLocation();
  }, [user?.id]);

  const handleSave = async () => {
    if (!city.trim() || !state.trim()) {
      toast.error('Por favor, preencha cidade e estado');
      return;
    }

    if (!user?.id) {
      toast.error('Usuário não autenticado. Faça login novamente.');
      return;
    }

    // Validate state format (2 letters)
    const stateValue = state.trim().toUpperCase();
    if (stateValue.length !== 2) {
      toast.error('Estado deve ter 2 letras (ex: SP, RJ)');
      return;
    }

    try {
      setSaving(true);
      
      // First check if settings exist
      const { data: existing } = await supabase
        .from('notification_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let error;
      
      if (existing) {
        // Update existing record
        const result = await supabase
          .from('notification_settings')
          .update({
            location_city: city.trim(),
            location_state: stateValue
          })
          .eq('user_id', user.id);
        error = result.error;
      } else {
        // Insert new record
        const result = await supabase
          .from('notification_settings')
          .insert({
            user_id: user.id,
            location_city: city.trim(),
            location_state: stateValue
          });
        error = result.error;
      }

      if (error) {
        console.error('Supabase error:', error.message, error.code);
        throw new Error(error.message);
      }

      toast.success('Localização atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating location:', error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao atualizar: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-36" />
        </CardContent>
      </Card>
    );
  }

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
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Localização'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
