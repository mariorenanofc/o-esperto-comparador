import { supabase } from '@/integrations/supabase/client';
import { errorHandler } from '@/lib/errorHandler';

export interface ApiKeyData {
  id: string;
  api_key: string;
  prefix: string;
  expires_at: string | null;
}

export const apiService = {
  async generateApiKey(name: string): Promise<ApiKeyData | null> {
    return errorHandler.retry(
      async () => {
        const { data, error } = await supabase.rpc('generate_api_key', {
          key_name: name,
          expires_in_days: 365
        });

        if (error) throw error;
        return data as unknown as ApiKeyData;
      },
      3,
      1000,
      { component: 'apiService', action: 'gerar chave de API' }
    );
  },

  async getApiKeys() {
    return errorHandler.handleAsync(
      async () => {
        const { data, error } = await supabase
          .from('api_keys')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      },
      { component: 'apiService', action: 'buscar chaves de API' },
      { severity: 'medium', showToast: true }
    );
  },

  async revokeApiKey(keyId: string) {
    return errorHandler.handleAsync(
      async () => {
        const { error } = await supabase
          .from('api_keys')
          .update({ is_active: false })
          .eq('id', keyId);

        if (error) throw error;
      },
      { component: 'apiService', action: 'revogar chave de API' },
      { severity: 'high', showToast: true }
    );
  },

  async testProductsEndpoint(apiKey: string) {
    return errorHandler.retry(
      async () => {
        const response = await fetch(
          'https://diqdsmrlhldanxxrtozl.supabase.co/functions/v1/api-products',
          {
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }

        return response.json();
      },
      3,
      2000,
      { component: 'apiService', action: 'testar endpoint de produtos' }
    );
  },

  async testComparisonsEndpoint(apiKey: string) {
    return errorHandler.retry(
      async () => {
        const response = await fetch(
          'https://diqdsmrlhldanxxrtozl.supabase.co/functions/v1/api-comparisons',
          {
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }

        return response.json();
      },
      3,
      2000,
      { component: 'apiService', action: 'testar endpoint de comparações' }
    );
  }
};