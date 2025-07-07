
import { supabase } from '@/integrations/supabase/client';

export const supabaseAdminService = {
  async approveContribution(contributionId: string): Promise<void> {
    console.log('=== ADMIN SERVICE: APPROVING CONTRIBUTION ===');
    console.log('Contribution ID:', contributionId);
    
    try {
      const { error } = await supabase
        .from('daily_offers')
        .update({ verified: true })
        .eq('id', contributionId);

      if (error) {
        console.error('Error approving contribution:', error);
        throw new Error(`Erro ao aprovar contribuição: ${error.message}`);
      }

      console.log('✅ Contribuição aprovada com sucesso');
    } catch (error) {
      console.error('❌ Erro no serviço de admin:', error);
      throw error;
    }
  },

  async rejectContribution(contributionId: string): Promise<void> {
    console.log('=== ADMIN SERVICE: REJECTING CONTRIBUTION ===');
    console.log('Contribution ID:', contributionId);
    
    try {
      const { error } = await supabase
        .from('daily_offers')
        .delete()
        .eq('id', contributionId);

      if (error) {
        console.error('Error rejecting contribution:', error);
        throw new Error(`Erro ao rejeitar contribuição: ${error.message}`);
      }

      console.log('✅ Contribuição rejeitada com sucesso');
    } catch (error) {
      console.error('❌ Erro no serviço de admin:', error);
      throw error;
    }
  },

  async getAllContributions(): Promise<any[]> {
    console.log('=== ADMIN SERVICE: FETCHING ALL CONTRIBUTIONS ===');
    
    try {
      const { data, error } = await supabase
        .from('daily_offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contributions:', error);
        throw error;
      }

      console.log('✅ Contribuições carregadas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao carregar contribuições:', error);
      throw error;
    }
  },

  async getAllSuggestions(): Promise<any[]> {
    console.log('=== ADMIN SERVICE: FETCHING ALL SUGGESTIONS ===');
    
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select(`
          *,
          profiles (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching suggestions:', error);
        throw error;
      }

      console.log('✅ Sugestões carregadas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao carregar sugestões:', error);
      throw error;
    }
  },

  async updateSuggestionStatus(suggestionId: string, status: string): Promise<void> {
    console.log('=== ADMIN SERVICE: UPDATING SUGGESTION STATUS ===');
    console.log('Suggestion ID:', suggestionId, 'Status:', status);
    
    try {
      const { error } = await supabase
        .from('suggestions')
        .update({ status })
        .eq('id', suggestionId);

      if (error) {
        console.error('Error updating suggestion status:', error);
        throw new Error(`Erro ao atualizar status da sugestão: ${error.message}`);
      }

      console.log('✅ Status da sugestão atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar status da sugestão:', error);
      throw error;
    }
  }
};
