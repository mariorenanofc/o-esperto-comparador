
import { supabase } from '@/integrations/supabase/client';

export interface SuggestionData {
  title: string;
  description: string;
  category: 'improvement' | 'feature' | 'bug' | 'other';
  userName: string;
  userEmail: string;
  userPhone?: string;
}

export interface UserFeedback {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in-review' | 'implemented' | 'closed';
  user_name: string;
  user_email: string;
  user_phone?: string;
  created_at: string;
}

export const contributionService = {
  async submitSuggestion(userId: string, data: SuggestionData) {
    console.log('Submitting suggestion:', { userId, data });
    
    try {
      // Primeiro, vamos verificar/criar o perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking profile:', profileError);
      }

      // Se o perfil não existe, criar um
      if (!profile) {
        console.log('Creating user profile...');
        await supabase
          .from('profiles')
          .insert({
            id: userId,
            name: data.userName,
            email: data.userEmail,
            plan: 'free'
          });
      }

      // Agora submeter a sugestão
      const { data: suggestion, error } = await supabase
        .from('suggestions')
        .insert({
          user_id: userId,
          title: data.title,
          description: data.description,
          category: data.category,
          status: 'open'
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting suggestion:', error);
        throw new Error('Erro ao enviar sugestão');
      }

      console.log('Suggestion submitted successfully:', suggestion);
      return suggestion;
    } catch (error) {
      console.error('Error in submitSuggestion:', error);
      throw error;
    }
  },

  async getAllFeedbacks(): Promise<UserFeedback[]> {
    console.log('Fetching all feedbacks...');
    
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
        console.error('Error fetching feedbacks:', error);
        throw error;
      }

      const feedbacks = data?.map(item => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        description: item.description,
        category: item.category,
        status: item.status as 'open' | 'in-review' | 'implemented' | 'closed',
        user_name: item.profiles?.name || 'Usuário não identificado',
        user_email: item.profiles?.email || 'Email não disponível',
        user_phone: undefined,
        created_at: item.created_at
      })) || [];

      console.log('Feedbacks fetched:', feedbacks);
      return feedbacks;
    } catch (error) {
      console.error('Error in getAllFeedbacks:', error);
      throw error;
    }
  },

  async updateFeedbackStatus(feedbackId: string, status: 'in-review' | 'implemented') {
    console.log('Updating feedback status:', { feedbackId, status });
    
    try {
      const { error } = await supabase
        .from('suggestions')
        .update({ status })
        .eq('id', feedbackId);

      if (error) {
        console.error('Error updating feedback status:', error);
        throw new Error('Erro ao atualizar status do feedback');
      }

      console.log('Feedback status updated successfully');
    } catch (error) {
      console.error('Error in updateFeedbackStatus:', error);
      throw error;
    }
  }
};
