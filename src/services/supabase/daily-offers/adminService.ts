
import { supabase } from '@/integrations/supabase/client';

export const adminService = {
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
