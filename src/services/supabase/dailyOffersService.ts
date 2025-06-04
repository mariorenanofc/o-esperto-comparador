
import { supabase } from '@/lib/supabase';
import { PriceContribution, DailyOffer } from '@/lib/types';

export const supabaseDailyOffersService = {
  async getTodaysOffers() {
    const today = new Date();
    const twentyFourHoursAgo = new Date(today.getTime() - (24 * 60 * 60 * 1000));

    const { data, error } = await supabase
      .from('daily_offers')
      .select('*')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching daily offers:', error);
      throw error;
    }

    return data?.map(offer => ({
      id: offer.id,
      productName: offer.product_name,
      price: offer.price,
      storeName: offer.store_name,
      city: offer.city,
      state: offer.state,
      contributorName: offer.contributor_name,
      userId: offer.user_id,
      timestamp: new Date(offer.created_at),
      verified: offer.verified,
    })) || [];
  },

  async submitPriceContribution(
    contribution: PriceContribution,
    userId: string,
    userName: string
  ): Promise<DailyOffer> {
    const { data, error } = await supabase
      .from('daily_offers')
      .insert({
        user_id: userId,
        product_name: contribution.productName,
        price: contribution.price,
        store_name: contribution.storeName,
        city: contribution.city,
        state: contribution.state,
        contributor_name: userName,
        verified: false, // Será implementada lógica de verificação
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting price contribution:', error);
      throw error;
    }

    return {
      id: data.id,
      productName: data.product_name,
      price: data.price,
      storeName: data.store_name,
      city: data.city,
      state: data.state,
      contributorName: data.contributor_name,
      userId: data.user_id,
      timestamp: new Date(data.created_at),
      verified: data.verified,
    };
  },

  async validateUserContribution(
    newContribution: PriceContribution,
    userId: string
  ) {
    const { data, error } = await supabase
      .from('daily_offers')
      .select('*')
      .eq('user_id', userId)
      .ilike('product_name', `%${newContribution.productName}%`)
      .ilike('store_name', `%${newContribution.storeName}%`)
      .eq('city', newContribution.city)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error validating contribution:', error);
      return { isValid: true };
    }

    if (data && data.length > 0) {
      return {
        isValid: false,
        message: 'Você já contribuiu com este produto nas últimas 24 horas',
      };
    }

    return { isValid: true };
  },
};
