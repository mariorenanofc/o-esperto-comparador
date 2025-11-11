import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Eye, EyeOff, Plus, Trash2, Calendar, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { logger } from '@/lib/logger';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  rate_limit_per_hour: number;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  usage_count: number;
  permissions: any;
}

export const ApiKeysManager: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyData, setNewKeyData] = useState<{ api_key: string; prefix: string } | null>(null);
  const { handleAsync } = useErrorHandler({ component: 'ApiKeysManager' });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    const result = await handleAsync(
      async () => {
        logger.info('Fetching API keys');
        const { data, error } = await supabase
          .from('api_keys')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const formattedData = (data || []).map(key => ({
          ...key,
          permissions: Array.isArray(key.permissions) ? key.permissions : JSON.parse(key.permissions as string || '["read"]')
        }));
        
        logger.info('API keys fetched', { count: formattedData.length });
        return formattedData;
      },
      { action: 'fetch_api_keys' },
      { showToast: true, severity: 'low' }
    );

    if (result) setApiKeys(result);
    setLoading(false);
  };

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      logger.warn('API key generation attempted without name');
      return;
    }

    setGenerating(true);
    const result = await handleAsync(
      async () => {
        logger.info('Generating API key', { name: newKeyName });
        const { data, error } = await supabase.rpc('generate_api_key', {
          key_name: newKeyName.trim(),
          expires_in_days: 365
        });

        if (error) throw error;
        logger.info('API key generated successfully');
        return data;
      },
      { action: 'generate_api_key' },
      { showToast: true, severity: 'medium' }
    );

    if (result) {
      setNewKeyData(result as any);
      setShowNewKey(true);
      setNewKeyName('');
      await fetchApiKeys();
    }
    setGenerating(false);
  };

  const revokeApiKey = async (keyId: string) => {
    await handleAsync(
      async () => {
        logger.info('Revoking API key', { keyId });
        const { error } = await supabase
          .from('api_keys')
          .update({ is_active: false })
          .eq('id', keyId);

        if (error) throw error;

        await fetchApiKeys();
        logger.info('API key revoked successfully', { keyId });
      },
      { action: 'revoke_api_key' },
      { showToast: true, severity: 'medium' }
    );
  };

  const copyToClipboard = async (text: string) => {
    await handleAsync(
      async () => {
        await navigator.clipboard.writeText(text);
        logger.info('Copied to clipboard');
      },
      { action: 'copy_to_clipboard' },
      { showToast: true, severity: 'low' }
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Chaves de API</CardTitle>
          <CardDescription>
            Carregando suas chaves de API...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Gerenciar Chaves de API
          </CardTitle>
          <CardDescription>
            Crie e gerencie chaves de API para acessar os endpoints públicos do EComparador.
            Rate limit padrão: 1000 requisições por hora.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="keyName">Nome da Nova Chave</Label>
              <Input
                id="keyName"
                placeholder="Ex: Minha Integração"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && generateApiKey()}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={generateApiKey} 
                disabled={generating || !newKeyName.trim()}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {generating ? 'Gerando...' : 'Gerar Chave'}
              </Button>
            </div>
          </div>

          {showNewKey && newKeyData && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Nova Chave de API Gerada!</CardTitle>
                <CardDescription className="text-green-600">
                  ⚠️ Esta é a única vez que você verá a chave completa. Copie e guarde em local seguro.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-3 bg-white rounded border">
                  <code className="flex-1 font-mono text-sm break-all">
                    {newKeyData.api_key}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(newKeyData.api_key)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  className="mt-3" 
                  onClick={() => setShowNewKey(false)}
                  variant="outline"
                >
                  Entendi, guardei a chave
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Suas Chaves de API</h3>
        {apiKeys.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma chave de API encontrada. Crie sua primeira chave acima.
              </p>
            </CardContent>
          </Card>
        ) : (
          apiKeys.map((key) => (
            <Card key={key.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{key.name}</h4>
                      <Badge variant={key.is_active ? "default" : "secondary"}>
                        {key.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {key.key_prefix}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        {key.usage_count} usos
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Criada em {format(new Date(key.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>

                    {key.last_used_at && (
                      <p className="text-sm text-muted-foreground">
                        Último uso: {format(new Date(key.last_used_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    )}

                    {key.expires_at && (
                      <p className="text-sm text-muted-foreground">
                        Expira em: {format(new Date(key.expires_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    )}

                    <div className="flex gap-1">
                      {key.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {key.is_active && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                          Revogar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revogar Chave de API</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja revogar a chave "{key.name}"? 
                            Esta ação não pode ser desfeita e interromperá todas as integrações que usam esta chave.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => revokeApiKey(key.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Sim, Revogar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentação da API</CardTitle>
          <CardDescription>
            Acesse a documentação completa dos endpoints disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={() => window.open('https://diqdsmrlhldanxxrtozl.supabase.co/functions/v1/api-docs', '_blank')}
          >
            Abrir Documentação da API
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};