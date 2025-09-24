import { supabase } from '@/integrations/supabase/client';

export interface ApiKeyData {
  id: string;
  api_key: string;
  prefix: string;
  expires_at: string | null;
}

export const apiService = {
  async generateApiKey(name: string): Promise<ApiKeyData> {
    const { data, error } = await supabase.rpc('generate_api_key', {
      key_name: name,
      expires_in_days: 365
    });

    if (error) throw error;
    return data as any;
  },

  async getApiKeys() {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async revokeApiKey(keyId: string) {
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', keyId);

    if (error) throw error;
  },

  // Example usage of the public API endpoints
  async testProductsEndpoint(apiKey: string) {
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
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  async testComparisonsEndpoint(apiKey: string) {
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
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
};