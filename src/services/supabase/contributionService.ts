import { supabase } from "@/integrations/supabase/client";
import { SuggestionData } from "@/services/contributionService";
import { errorHandler } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

export const supabaseContributionService = {
  async submitSuggestion(userId: string, data: SuggestionData) {
    return errorHandler.retry(
      async () => {
        logger.info('Submitting suggestion', { userId, category: data.category });
        
        const { data: suggestion, error } = await supabase
          .from("suggestions")
          .insert({
            user_id: userId,
            title: data.title,
            description: data.description,
            category: data.category,
            status: "open",
          })
          .select()
          .single();

        if (error) throw error;
        
        try {
          await supabase.functions.invoke('notify-admins', {
            body: {
              type: 'suggestion',
              title: 'Nova sugestão enviada',
              body: data.title,
              url: '/admin'
            }
          });
        } catch (e) {
          logger.warn('notify-admins failed (suggestion)', { error: e });
        }

        logger.info('Suggestion submitted successfully', { suggestionId: suggestion.id });
        return suggestion;
      },
      3,
      1000,
      { component: 'supabaseContributionService', action: 'enviar sugestão', userId }
    );
  },

  async getUserSuggestions(userId: string) {
    return errorHandler.retry(
      async () => {
        logger.info('Fetching user suggestions', { userId });
        
        const { data, error } = await supabase
          .from("suggestions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const suggestions = (data || []).map(item => ({
          ...item,
          status: item.status as "open" | "in-review" | "implemented" | "closed"
        }));
        
        logger.info('User suggestions fetched', { userId, count: suggestions.length });
        return suggestions;
      },
      3,
      1000,
      { component: 'supabaseContributionService', action: 'buscar sugestões do usuário', userId }
    ) || [];
  },

  async getAllSuggestions() {
    return errorHandler.retry(
      async () => {
        logger.info('Fetching all suggestions');
        
        const { data, error } = await supabase
          .from("suggestions")
          .select(
            `
            *,
            profile:profiles(name, email)
          `
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        const suggestions = (data || []).map(item => ({
          ...item,
          status: item.status as "open" | "in-review" | "implemented" | "closed"
        }));
        
        logger.info('All suggestions fetched', { count: suggestions.length });
        return suggestions;
      },
      3,
      1000,
      { component: 'supabaseContributionService', action: 'buscar todas as sugestões' }
    ) || [];
  },

  async updateSuggestionStatus(
    suggestionId: string,
    status: "open" | "in-review" | "implemented" | "closed"
  ) {
    return errorHandler.handleAsync(
      async () => {
        logger.info('Updating suggestion status', { suggestionId, status });
        
        const { data, error } = await supabase
          .from("suggestions")
          .update({ status })
          .eq("id", suggestionId)
          .select()
          .single();

        if (error) throw error;

        logger.info('Suggestion status updated', { suggestionId, status });
        return data;
      },
      { component: 'supabaseContributionService', action: 'atualizar status da sugestão', metadata: { suggestionId, status } },
      { severity: 'medium', showToast: true }
    );
  },
};
