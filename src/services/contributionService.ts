// src/services/contributionService.ts
import { supabase } from "@/integrations/supabase/client";
import { UserFeedback } from "@/lib/types";
import { supabaseContributionService } from "./supabase/contributionService";
import { logger } from "@/lib/logger";
import { errorHandler } from "@/lib/errorHandler";

export interface SuggestionData {
  title: string;
  description: string;
  category: "improvement" | "feature" | "bug" | "other";
  userName: string;
  userEmail: string;
  userPhone?: string;
}

// UserFeedback já existe em '@/lib/types.ts', mas deixei aqui para referência da estrutura
// Se já estiver em lib/types.ts, não precisa duplicar aqui.
// export interface UserFeedback {
//   id: string;
//   user_id: string;
//   title: string;
//   description: string;
//   category: string;
//   status: 'open' | 'in-review' | 'implemented' | 'closed';
//   user_name: string;
//   user_email: string;
//   user_phone?: string;
//   created_at: string;
// }

export const contributionService = {
  async submitSuggestion(userId: string, data: SuggestionData) {
    logger.info("Submitting suggestion", { userId, category: data.category });

    return errorHandler.retry(
      async () => {
        // Primeiro, vamos verificar/criar o perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          logger.warn("Error checking profile", { profileError });
        }

        // Se o perfil não existe, criar um
        if (!profile) {
          logger.info("Creating user profile for suggestion");
          await supabase.from("profiles").insert({
            id: userId,
            name: data.userName,
            email: data.userEmail,
            plan: "free",
          });
        }

        // Agora submeter a sugestão
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

        if (error) {
          logger.error("Error submitting suggestion", error, { userId, category: data.category });
          throw new Error("Erro ao enviar sugestão");
        }

        logger.info("Suggestion submitted successfully", { suggestionId: suggestion.id });
        return suggestion;
      },
      3,
      1000,
      { component: "contributionService", action: "submitSuggestion" }
    );
  },

  async getAllFeedbacks(): Promise<UserFeedback[]> {
    logger.info("Fetching all feedbacks");

    return errorHandler.retry(
      async () => {
        const { data, error } = await supabase
          .from("suggestions")
          .select(
            `
          *,
          profiles (
            name,
            email
          )
        `
          )
          .order("created_at", { ascending: false });

        if (error) {
          logger.error("Error fetching feedbacks", error);
          throw error;
        }

        const feedbacks =
          data?.map((item) => ({
            id: item.id,
            user_id: item.user_id,
            title: item.title,
            description: item.description,
            category: item.category,
            status: item.status as
              | "open"
              | "in-review"
              | "implemented"
              | "closed",
            user_name: item.profiles?.name || "Usuário não identificado",
            user_email: item.profiles?.email || "Email não disponível",
            user_phone: undefined,
            created_at: item.created_at,
          })) || [];

        logger.info("Feedbacks fetched successfully", { count: feedbacks.length });
        return feedbacks;
      },
      3,
      1000,
      { component: "contributionService", action: "getAllFeedbacks" }
    );
  },

  async updateFeedbackStatus(
    feedbackId: string,
    status: "in-review" | "implemented"
  ) {
    logger.info("Updating feedback status", { feedbackId, status });

    return errorHandler.retry(
      async () => {
        const { error } = await supabase
          .from("suggestions")
          .update({ status })
          .eq("id", feedbackId);

        if (error) {
          logger.error("Error updating feedback status", error, { feedbackId, status });
          throw new Error("Erro ao atualizar status do feedback");
        }

        logger.info("Feedback status updated successfully", { feedbackId, status });
      },
      2,
      1000,
      { component: "contributionService", action: "updateFeedbackStatus" }
    );
  },

  // Método getUserSuggestions 
  async getUserSuggestions(userId: string): Promise<UserFeedback[]> {
    return await supabaseContributionService.getUserSuggestions(userId);
  },
};
