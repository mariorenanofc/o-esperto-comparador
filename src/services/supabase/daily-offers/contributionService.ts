
import { supabase } from '@/integrations/supabase/client';
import { PriceContribution } from '@/lib/types';

export const contributionService = {
  async submitPriceContribution(contribution: PriceContribution, userId: string, contributorName: string): Promise<void> {
    console.log('Submitting price contribution:', contribution);
    
    try {
      // Verificar se já existe uma contribuição similar do mesmo usuário nas últimas 24 horas
      const twentyFourHoursAgo = new Date(Date.now() - (24 * 60 * 60 * 1000));
      
      const { data: existingContributions, error: checkError } = await supabase
        .from('daily_offers')
        .select('*')
        .eq('user_id', userId)
        .eq('product_name', contribution.productName)
        .eq('store_name', contribution.storeName)
        .gte('created_at', twentyFourHoursAgo.toISOString());

      if (checkError) {
        console.error('Error checking existing contributions:', checkError);
        throw new Error(`Erro ao verificar contribuições existentes: ${checkError.message}`);
      }

      if (existingContributions && existingContributions.length > 0) {
        throw new Error('Você já contribuiu com este produto nesta loja nas últimas 24 horas. Aguarde para fazer uma nova contribuição.');
      }

      // Preparar dados para inserção
      const contributionData = {
        user_id: userId,
        product_name: contribution.productName,
        price: contribution.price,
        store_name: contribution.storeName,
        city: contribution.city,
        state: contribution.state,
        contributor_name: contributorName,
        quantity: contribution.quantity || 1,
        unit: contribution.unit || 'unidade',
        verified: false // Novas contribuições sempre começam como não verificadas
      };

      const { error } = await supabase
        .from('daily_offers')
        .insert([contributionData]);

      if (error) {
        console.error('Error submitting contribution:', error);
        throw new Error(`Erro ao enviar contribuição: ${error.message}`);
      }

      console.log('Contribution submitted successfully');

      try {
        await supabase.functions.invoke('notify-admins', {
          body: {
            type: 'contribution',
            title: 'Nova contribuição de preço',
            body: `${contribution.productName} em ${contribution.storeName}`,
            url: '/admin'
          }
        });
      } catch (e) {
        console.warn('notify-admins failed (contribution)', e);
      }
    } catch (error) {
      console.error('Error in submitPriceContribution:', error);
      throw error;
    }
  }
};
