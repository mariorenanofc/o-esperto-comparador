
import { supabase } from '@/integrations/supabase/client';
import { PriceContribution, PriceValidationResult } from '@/lib/types';
import { baseDailyOffersService } from './baseService';

export const validationService = {
  async validateUserContribution(contribution: PriceContribution, userId: string): Promise<PriceValidationResult> {
    console.log('Validating user contribution:', { contribution, userId });
    
    try {
      const today = await baseDailyOffersService.getTodaysDate();
      
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
  }
};
