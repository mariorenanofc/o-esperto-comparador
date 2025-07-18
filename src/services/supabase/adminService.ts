import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const supabaseAdminService = {
  async approveContribution(contributionId: string): Promise<void> {
    console.log("=== ADMIN SERVICE: APPROVING CONTRIBUTION ===");
    console.log("Contribution ID:", contributionId);

    try {
      const { error } = await supabase
        .from("daily_offers")
        .update({ verified: true })
        .eq("id", contributionId);

      if (error) {
        console.error("Error approving contribution:", error);
        throw new Error(`Erro ao aprovar contribuição: ${error.message}`);
      }

      console.log("✅ Contribuição aprovada com sucesso");
    } catch (error) {
      console.error("❌ Erro no serviço de admin:", error);
      throw error;
    }
  },

  async rejectContribution(contributionId: string): Promise<void> {
    console.log("=== ADMIN SERVICE: REJECTING CONTRIBUTION ===");
    console.log("Contribution ID:", contributionId);

    try {
      const { error } = await supabase
        .from("daily_offers")
        .delete()
        .eq("id", contributionId);

      if (error) {
        console.error("Error rejecting contribution:", error);
        throw new Error(`Erro ao rejeitar contribuição: ${error.message}`);
      }

      console.log("✅ Contribuição rejeitada com sucesso");
    } catch (error) {
      console.error("❌ Erro no serviço de admin:", error);
      throw error;
    }
  },

  async getAllContributions(): Promise<any[]> {
    console.log("=== ADMIN SERVICE: FETCHING ALL CONTRIBUTIONS ===");

    try {
      const { data, error } = await supabase
        .from("daily_offers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching contributions:", error);
        throw error;
      }

      console.log("✅ Contribuições carregadas:", data?.length || 0);
      return data || [];
    } catch (error) {
      console.error("❌ Erro ao carregar contribuições:", error);
      throw error;
    }
  },

  async getAllSuggestions(): Promise<any[]> {
    console.log("=== ADMIN SERVICE: FETCHING ALL SUGGESTIONS ===");

    try {
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
        console.error("Error fetching suggestions:", error);
        throw error;
      }

      console.log("✅ Sugestões carregadas:", data?.length || 0);
      return data || [];
    } catch (error) {
      console.error("❌ Erro ao carregar sugestões:", error);
      throw error;
    }
  },

  async updateSuggestionStatus(
    suggestionId: string,
    status: string
  ): Promise<void> {
    console.log("=== ADMIN SERVICE: UPDATING SUGGESTION STATUS ===");
    console.log("Suggestion ID:", suggestionId, "Status:", status);

    try {
      const { error } = await supabase
        .from("suggestions")
        .update({ status })
        .eq("id", suggestionId);

      if (error) {
        console.error("Error updating suggestion status:", error);
        throw new Error(
          `Erro ao atualizar status da sugestão: ${error.message}`
        );
      }

      console.log("✅ Status da sugestão atualizado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao atualizar status da sugestão:", error);
      throw error;
    }
  },

  async incrementComparisonsMade(userId: string): Promise<void> {
    console.log(
      `=== ADMIN SERVICE: INCREMENTING COMPARISONS MADE FOR USER: ${userId} ===`
    );

    try {
      // 1. Buscar o perfil atual do usuário
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("comparisons_made_this_month, last_comparison_reset_month")
        .eq("id", userId)
        .single();

      if (fetchError) {
        console.error(
          "Error fetching user profile for comparison count:",
          fetchError
        );
        throw new Error(
          `Erro ao buscar perfil para contagem de comparações: ${fetchError.message}`
        );
      }

      const currentMonth = new Date().getMonth() + 1; // Mês atual (1-12)
      let newComparisonsMade = (profile.comparisons_made_this_month || 0) + 1;
      let newLastResetMonth =
        profile.last_comparison_reset_month || currentMonth;

      // 2. Verificar se o mês mudou para resetar o contador
      if (newLastResetMonth !== currentMonth) {
        console.log(
          `Mês mudou para o usuário ${userId}. Resetando contador de comparações.`
        );
        newComparisonsMade = 1; // Inicia a contagem para o novo mês
        newLastResetMonth = currentMonth; // Atualiza o mês do último reset
      }

      // 3. Atualizar o contador no banco de dados
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          comparisons_made_this_month: newComparisonsMade,
          last_comparison_reset_month: newLastResetMonth,
          // Garante que o status online e a última atividade sejam atualizados
          last_activity: new Date().toISOString(),
          is_online: true,
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating comparisons made count:", updateError);
        throw new Error(
          `Erro ao atualizar contador de comparações: ${updateError.message}`
        );
      }

      console.log(
        `✅ Contador de comparações atualizado para ${newComparisonsMade} para o usuário ${userId}.`
      );
    } catch (error) {
      console.error("❌ Erro no serviço de incremento de comparações:", error);
      throw error;
    }
  },

  async getAllUsers(): Promise<any[]> {
    console.log("=== ADMIN SERVICE: FETCHING ALL USERS ===");

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      console.log("✅ Usuários carregados:", data?.length || 0);
      return data || [];
    } catch (error) {
      console.error("❌ Erro ao carregar usuários:", error);
      throw error;
    }
  },

  async getActiveUsers(): Promise<any[]> {
    console.log("=== ADMIN SERVICE: FETCHING ACTIVE USERS ===");

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_online", true)
        .order("last_activity", { ascending: false });

      if (error) {
        console.error("Error fetching active users:", error);
        throw error;
      }

      console.log("✅ Usuários ativos carregados:", data?.length || 0);
      return data || [];
    } catch (error) {
      console.error("❌ Erro ao carregar usuários ativos:", error);
      throw error;
    }
  },

  async updateUserPlan(userId: string, plan: string): Promise<void> {
    console.log("=== ADMIN SERVICE: UPDATING USER PLAN ===");
    console.log("User ID:", userId, "Plan:", plan);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ plan })
        .eq("id", userId);

      if (error) {
        console.error("Error updating user plan:", error);
        throw new Error(`Erro ao atualizar plano do usuário: ${error.message}`);
      }

      console.log("✅ Plano do usuário atualizado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao atualizar plano do usuário:", error);
      throw error;
    }
  },

  async getAnalytics(): Promise<any> {
    console.log("=== ADMIN SERVICE: FETCHING ANALYTICS ===");

    try {
      const { data: contributions, error: contributionsError } = await supabase
        .from("daily_offers")
        .select("*");

      if (contributionsError) {
        console.error(
          "Error fetching contributions for analytics:",
          contributionsError
        );
        throw contributionsError;
      }

      const { data: suggestions, error: suggestionsError } = await supabase
        .from("suggestions")
        .select("*");

      if (suggestionsError) {
        console.error(
          "Error fetching suggestions for analytics:",
          suggestionsError
        );
        throw suggestionsError;
      }

      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("*");

      if (usersError) {
        console.error("Error fetching users for analytics:", usersError);
        throw usersError;
      }

      const analytics = {
        totalContributions: contributions?.length || 0,
        verifiedContributions:
          contributions?.filter((c) => c.verified).length || 0,
        totalSuggestions: suggestions?.length || 0,
        totalUsers: users?.length || 0,
        activeUsers: users?.filter((u) => u.is_online).length || 0,
      };

      console.log("✅ Analytics carregadas:", analytics);
      return analytics;
    } catch (error) {
      console.error("❌ Erro ao carregar analytics:", error);
      throw error;
    }
  },
};
