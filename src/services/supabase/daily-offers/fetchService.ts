
import { supabase } from '@/integrations/supabase/client';
import { DailyOffer } from '@/lib/types';
import { secureLogger } from '@/lib/secureLogger';

export const fetchService = {
  // Map offers data excluding PII fields (contributor_name, user_id removed)
  mapOffersData(data: any[]): DailyOffer[] {
    return data.map(item => ({
      id: item.id,
      productName: item.product_name,
      price: Number(item.price),
      storeName: item.store_name,
      city: item.city,
      state: item.state,
      contributorName: 'Anônimo', // Don't expose real contributor names
      userId: '', // Don't expose user IDs
      timestamp: new Date(item.created_at || ''),
      verified: item.verified || false,
      quantity: item.quantity || 1,
      unit: item.unit || 'unidade'
    }));
  },

  async getTodaysOffers(): Promise<DailyOffer[]> {
    secureLogger.log('Fetching today\'s offers...');
    
    try {
      const { data, error } = await supabase
        .from('daily_offers_public')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching offers:', error);
        throw error;
      }

      const offers = this.mapOffersData(data || []);
      console.log('Fetched offers from secure view:', offers.length);
      
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

};
