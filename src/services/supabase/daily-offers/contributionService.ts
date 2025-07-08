
import { supabase } from '@/integrations/supabase/client';
import { PriceContribution } from '@/lib/types';
import { baseDailyOffersService } from './baseService';

export const contributionService = {
  async submitPriceContribution(contribution: PriceContribution, userId: string, contributorName: string): Promise<void> {
    console.log('=== CONTRIBUTION SERVICE ===');
    console.log('Submitting price contribution:', { contribution, userId, contributorName });
    
    try {
      const { user, error: authError } = await baseDailyOffersService.checkUserAuthentication();
      if (authError) {
        throw new Error(authError);
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
  }
};
