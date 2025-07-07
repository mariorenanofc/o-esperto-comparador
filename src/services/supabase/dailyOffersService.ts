
import { supabase } from '@/integrations/supabase/client';
import { PriceContribution, DailyOffer, PriceValidationResult } from '@/lib/types';

export const supabaseDailyOffersService = {
  async submitPriceContribution(contribution: PriceContribution, userId: string, contributorName: string): Promise<void> {
    console.log('=== SUPABASE DAILY OFFERS SERVICE ===');
    console.log('Submitting price contribution:', { contribution, userId, contributorName });
    
    try {
      // Verificar se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Authentication error:', authError);
        throw new Error('Usuário não autenticado');
      }

      console.log('User authenticated:', user.id);

      const insertData = {
        user_id: userId,
        product_name: contribution.productName.trim(),
        price: Number(contribution.price),
        store_name: contribution.storeName.trim(),
        city: contribution.city.trim(),
        state: contribution.state.trim(),
        contributor_name: contributorName.trim(),
        quantity: contribution.quantity || 1,
        unit: contribution.unit || 'unidade',
        verified: false
      };

      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from('daily_offers')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        throw new Error(`Erro na base de dados: ${error.message}`);
      }

      console.log('Price contribution submitted successfully:', data);
    } catch (error) {
      console.error('=== ERROR IN SUBMIT PRICE CONTRIBUTION ===');
      console.error('Error type:', typeof error);
      console.error('Error:', error);
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Erro desconhecido ao enviar contribuição');
      }
    }
  },

  async validateUserContribution(contribution: PriceContribution, userId: string): Promise<PriceValidationResult> {
    console.log('Validating user contribution:', { contribution, userId });
    
    try {
      // Verificar se o usuário já contribuiu hoje para o mesmo produto/loja
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: existingContributions, error } = await supabase
        .from('daily_offers')
        .select('*')
        .eq('user_id', userId)
        .eq('product_name', contribution.productName.trim())
        .eq('store_name', contribution.storeName.trim())
        .gte('created_at', today.toISOString());

      if (error) {
        console.error('Error validating contribution:', error);
        return { isValid: false, message: 'Erro ao validar contribuição' };
      }

      if (existingContributions && existingContributions.length > 0) {
        return { 
          isValid: false, 
          message: 'Você já contribuiu com este produto/loja hoje. Tente novamente amanhã.' 
        };
      }

      // Verificar se há preços muito diferentes para o mesmo produto
      const { data: similarOffers } = await supabase
        .from('daily_offers')
        .select('*')
        .eq('product_name', contribution.productName.trim())
        .eq('city', contribution.city.trim())
        .eq('state', contribution.state.trim())
        .gte('created_at', today.toISOString());

      if (similarOffers && similarOffers.length > 0) {
        const avgPrice = similarOffers.reduce((sum, offer) => sum + Number(offer.price), 0) / similarOffers.length;
        const priceDifference = Math.abs(contribution.price - avgPrice) / avgPrice;
        
        if (priceDifference > 0.5) { // 50% de diferença
          return {
            isValid: true,
            message: `Preço muito diferente da média (R$ ${avgPrice.toFixed(2)}). Tem certeza?`,
            priceDifference: priceDifference * 100
          };
        }
      }

      return { isValid: true, message: 'Contribuição válida' };
    } catch (error) {
      console.error('Error in validateUserContribution:', error);
      return { isValid: false, message: 'Erro ao validar contribuição' };
    }
  },

  async getTodaysOffers(): Promise<DailyOffer[]> {
    console.log('Fetching today\'s offers...');
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('daily_offers')
        .select('*')
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
        .select('*')
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
  },

  async approveContribution(contributionId: string): Promise<void> {
    console.log('Approving contribution:', contributionId);
    
    try {
      const { error } = await supabase
        .from('daily_offers')
        .update({ verified: true })
        .eq('id', contributionId);

      if (error) {
        console.error('Error approving contribution:', error);
        throw new Error(`Erro ao aprovar contribuição: ${error.message}`);
      }

      console.log('Contribution approved successfully');
    } catch (error) {
      console.error('Error in approveContribution:', error);
      throw error;
    }
  },

  async rejectContribution(contributionId: string): Promise<void> {
    console.log('Rejecting contribution:', contributionId);
    
    try {
      const { error } = await supabase
        .from('daily_offers')
        .delete()
        .eq('id', contributionId);

      if (error) {
        console.error('Error rejecting contribution:', error);
        throw new Error(`Erro ao rejeitar contribuição: ${error.message}`);
      }

      console.log('Contribution rejected successfully');
    } catch (error) {
      console.error('Error in rejectContribution:', error);
      throw error;
    }
  }
};
