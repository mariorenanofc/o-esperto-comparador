
import { supabase } from '@/integrations/supabase/client';
import { DailyOffer } from '@/lib/types';
import { baseDailyOffersService } from './baseService';

export const fetchService = {
  async getTodaysOffers(): Promise<DailyOffer[]> {
    console.log('Fetching today\'s offers...');
    
    try {
      const today = await baseDailyOffersService.getTodaysDate();

      const { data, error } = await supabase
        .from('daily_offers')
        .select('*, quantity, unit')
        .gte('created_at', today.toISOString())
        .eq('verified', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching today\'s offers:', error);
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

      console.log('Fetched today\'s offers:', offers.length);
      return offers;
    } catch (error) {
      console.error('Error in getTodaysOffers:', error);
      return [];
    }
  },

  async getAllContributions(): Promise<any[]> {
    console.log('Fetching all contributions for admin...');
    
    try {
      const { data, error } = await supabase
        .from('daily_offers')
        .select('*, quantity, unit')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contributions:', error);
        throw error;
      }

      console.log('Fetched contributions:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getAllContributions:', error);
      return [];
    }
  }
};
