
import { supabase } from '@/integrations/supabase/client';
import { errorHandler } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';

export const adminService = {
  async approveContribution(contributionId: string): Promise<void> {
    return errorHandler.handleAsync(
      async () => {
        logger.info('Approving contribution', { contributionId });
        
        // First get the contribution details to notify the user
        const { data: contribution, error: fetchError } = await supabase
          .from('daily_offers')
          .select('user_id, product_name, store_name, contributor_name')
          .eq('id', contributionId)
          .single();

        if (fetchError) throw fetchError;

        // Update the contribution as verified
        const { error } = await supabase
          .from('daily_offers')
          .update({ verified: true })
          .eq('id', contributionId);

        if (error) throw error;

        logger.info('Contribution approved successfully', { 
          contributionId, 
          contributor: contribution.contributor_name 
        });
      },
      { 
        component: 'adminService', 
        action: 'aprovar contribuição',
        metadata: { contributionId }
      },
      { severity: 'high', showToast: true }
    ) as Promise<void>;
  },

  async rejectContribution(contributionId: string): Promise<void> {
    return errorHandler.handleAsync(
      async () => {
        logger.info('Rejecting contribution', { contributionId });
        
        const { error } = await supabase
          .from('daily_offers')
          .delete()
          .eq('id', contributionId);

        if (error) throw error;

        logger.info('Contribution rejected successfully', { contributionId });
      },
      { 
        component: 'adminService', 
        action: 'rejeitar contribuição',
        metadata: { contributionId }
      },
      { severity: 'high', showToast: true }
    ) as Promise<void>;
  }
};
