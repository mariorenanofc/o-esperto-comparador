import { supabase } from "@/integrations/supabase/client";

export const supabaseReportsService = {
  async getUserMonthlyReports(userId: string) {
    const { data, error } = await supabase
      .from("monthly_reports")
      .select("*")
      .eq("user_id", userId)
      .order("year", { ascending: false })
      .order("month", { ascending: false });

    if (error) {
      console.error("Error fetching monthly reports:", error);
      throw error;
    }

    return data || [];
  },

  async createOrUpdateMonthlyReport(
    userId: string,
    month: string,
    year: number,
    totalSpent: number
  ) {
    const { data: existing } = await supabase
      .from("monthly_reports")
      .select("*")
      .eq("user_id", userId)
      .eq("month", month)
      .eq("year", year)
      .single();

    if (existing) {
      // Atualizar existente
      const { data, error } = await supabase
        .from("monthly_reports")
        .update({ total_spent: totalSpent })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Criar novo
      const { data, error } = await supabase
        .from("monthly_reports")
        .insert({
          user_id: userId,
          month,
          year,
          total_spent: totalSpent,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async getComparisonsByMonth(userId: string, month: string, year: number) {
    const startDate = new Date(year, parseInt(month) - 1, 1);
    const endDate = new Date(year, parseInt(month), 0);

    const { data, error } = await supabase
      .from("comparisons")
      .select(
        `
        *,
        comparison_products (
          product:products (*)
        )
      `
      )
      .eq("user_id", userId)
      .gte("date", startDate.toISOString())
      .lte("date", endDate.toISOString())
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching comparisons by month:", error);
      throw error;
    }

    return data || [];
  },
};
