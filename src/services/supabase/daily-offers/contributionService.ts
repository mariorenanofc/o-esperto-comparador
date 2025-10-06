
import { supabase } from '@/integrations/supabase/client';
import { PriceContribution } from '@/lib/types';
import { errorHandler } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';

export const contributionService = {
  async submitPriceContribution(contribution: PriceContribution, userId: string, contributorName: string): Promise<void> {
    return errorHandler.handleAsync(
      async () => {
        logger.info('Submitting price contribution', { 
          product: contribution.productName, 
          store: contribution.storeName,
          userId 
        });
        
        // Verificar se já existe uma contribuição similar do mesmo usuário nas últimas 24 horas
        const twentyFourHoursAgo = new Date(Date.now() - (24 * 60 * 60 * 1000));
        
        const { data: existingContributions, error: checkError } = await supabase
          .from('daily_offers')
          .select('*')
          .eq('user_id', userId)
          .eq('product_name', contribution.productName)
          .eq('store_name', contribution.storeName)
          .gte('created_at', twentyFourHoursAgo.toISOString());

        if (checkError) throw checkError;

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
          verified: false
        };

        const { error } = await supabase
          .from('daily_offers')
          .insert([contributionData]);

        if (error) throw error;

        logger.info('Contribution submitted successfully', { contributorName });
      },
      { 
        component: 'contributionService', 
        action: 'enviar contribuição de preço',
        userId,
        metadata: { product: contribution.productName, store: contribution.storeName }
      },
      { severity: 'high', showToast: true }
    ) as Promise<void>;
  }
};
