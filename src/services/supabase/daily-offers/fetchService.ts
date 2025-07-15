
import { supabase } from '@/integrations/supabase/client';
import { DailyOffer } from '@/lib/types';

export const fetchService = {
  async getTodaysOffers(): Promise<DailyOffer[]> {
    console.log('Fetching today\'s offers...');
    
    try {
      // Primeiro executar limpeza manual para garantir que dados antigos sejam removidos
      await this.cleanupOldOffers();
      
      // Buscar apenas ofertas verificadas das últimas 24 horas
      const twentyFourHoursAgo = new Date(Date.now() - (24 * 60 * 60 * 1000));
      
      const { data, error } = await supabase
        .from('daily_offers')
        .select('*, quantity, unit')
        .eq('verified', true)
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching verified offers:', error);
        throw error;
      }

      const offers = data?.map(item => ({
        id: item.id,
        productName: item.product_name,
        price: Number(item.price),
        storeName: item.store_name,
        city: item.city,
        state: item.state,
        contributorName: item.contributor_name,
        userId: item.user_id,
        timestamp: new Date(item.created_at || ''),
        verified: item.verified || false,
        quantity: item.quantity || 1,
        unit: item.unit || 'unidade'
      })) || [];

      console.log('Fetched today\'s offers (last 24h):', offers.length);
      return offers;
    } catch (error) {
      console.error('Error in getTodaysOffers:', error);
      return [];
    }
  },

  async getAllContributions(): Promise<any[]> {
    console.log('Fetching all contributions for admin...');
    
    try {
      // Para admin, mostrar todas as contribuições incluindo as pendentes (não verificadas)
      // mas ainda respeitando o limite de 24 horas
      const twentyFourHoursAgo = new Date(Date.now() - (24 * 60 * 60 * 1000));
      
      const { data, error } = await supabase
        .from('daily_offers')
        .select('*, quantity, unit')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contributions:', error);
        throw error;
      }

      console.log('Fetched contributions (last 24h):', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getAllContributions:', error);
      return [];
    }
  },

  async cleanupOldOffers(): Promise<void> {
    try {
      console.log('Executing manual cleanup of old offers...');
      
      // Chamar a função de limpeza do banco de dados
      const { error } = await supabase.rpc('cleanup_old_daily_offers');
      
      if (error) {
        console.error('Error during cleanup:', error);
      } else {
        console.log('Cleanup completed successfully');
      }
    } catch (error) {
      console.error('Error in cleanupOldOffers:', error);
    }
  }
};
