
import { supabase } from '@/integrations/supabase/client';

export const adminService = {
  async approveContribution(contributionId: string): Promise<void> {
    console.log('Approving contribution:', contributionId);
    
    try {
      // First get the contribution details to notify the user
      const { data: contribution, error: fetchError } = await supabase
        .from('daily_offers')
        .select('user_id, product_name, store_name, contributor_name')
        .eq('id', contributionId)
        .single();

      if (fetchError) {
        console.error('Error fetching contribution details:', fetchError);
        throw new Error(`Erro ao buscar contribuição: ${fetchError.message}`);
      }

      // Update the contribution as verified
      const { error } = await supabase
        .from('daily_offers')
        .update({ verified: true })
        .eq('id', contributionId);

      if (error) {
        console.error('Error approving contribution:', error);
        throw new Error(`Erro ao aprovar contribuição: ${error.message}`);
      }

      console.log('Contribution approved successfully');

      // Real-time notification will be triggered automatically by database UPDATE
      console.log('Real-time notification will be sent via Supabase realtime');
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
