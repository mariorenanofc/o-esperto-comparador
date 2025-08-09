import { supabase } from "@/integrations/supabase/client";
import { SuggestionData } from "@/services/contributionService";

export const supabaseContributionService = {
  async submitSuggestion(userId: string, data: SuggestionData) {
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
      console.error("Error submitting suggestion:", error);
      throw error;
    }
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
      console.warn('notify-admins failed (suggestion)', e);
    }

    return suggestion;
  },

  async getUserSuggestions(userId: string) {
    const { data, error } = await supabase
      .from("suggestions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user suggestions:", error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      status: item.status as "open" | "in-review" | "implemented" | "closed"
    }));
  },

  async getAllSuggestions() {
    const { data, error } = await supabase
      .from("suggestions")
      .select(
        `
        *,
        profile:profiles(name, email)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all suggestions:", error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      status: item.status as "open" | "in-review" | "implemented" | "closed"
    }));
  },

  async updateSuggestionStatus(
    suggestionId: string,
    status: "open" | "in-review" | "implemented" | "closed"
  ) {
    const { data, error } = await supabase
      .from("suggestions")
      .update({ status })
      .eq("id", suggestionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating suggestion status:", error);
      throw error;
    }

    return data;
  },
};
