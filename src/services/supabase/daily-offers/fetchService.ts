
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
        // Em caso de erro, tentar buscar sem filtro de verificação como fallback
        const { data: fallbackData } = await supabase
          .from('daily_offers')
          .select('*, quantity, unit')
          .gte('created_at', twentyFourHoursAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (fallbackData && fallbackData.length > 0) {
          console.log('Using fallback data with unverified offers');
          return this.mapOffersData(fallbackData);
        }
        throw error;
      }

      const offers = this.mapOffersData(data || []);
      console.log('Fetched today\'s offers (last 24h):', offers.length);
      
      // Se não há ofertas verificadas, buscar algumas não verificadas como fallback
      if (offers.length === 0) {
        console.log('No verified offers found, checking for unverified ones...');
        const { data: unverifiedData } = await supabase
          .from('daily_offers')
          .select('*, quantity, unit')
          .eq('verified', false)
          .gte('created_at', twentyFourHoursAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (unverifiedData && unverifiedData.length > 0) {
          console.log('Found unverified offers as fallback:', unverifiedData.length);
          return this.mapOffersData(unverifiedData);
        }
      }
      
      return offers;
    } catch (error) {
      console.error('Error in getTodaysOffers:', error);
      return [];
    }
  },

  mapOffersData(data: any[]): DailyOffer[] {
    return data.map(item => ({
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
    }));
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
      
      // Executar limpeza manual removendo ofertas antigas
      const twentyFourHoursAgo = new Date(Date.now() - (24 * 60 * 60 * 1000));
      
      const { error } = await supabase
        .from('daily_offers')
        .delete()
        .lt('created_at', twentyFourHoursAgo.toISOString());
      
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
