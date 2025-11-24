import { supabase } from "@/integrations/supabase/client";
import { errorHandler } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

export const supabaseReportsService = {
  async getUserMonthlyReports(userId: string) {
    return errorHandler.retry(
      async () => {
        logger.info('Fetching monthly reports', { userId });
        
        const { data, error } = await supabase
          .from("monthly_reports")
          .select("*")
          .eq("user_id", userId)
          .order("year", { ascending: false })
          .order("month", { ascending: false });

        if (error) throw error;

        logger.info('Monthly reports fetched', { userId, count: data?.length || 0 });
        return data || [];
      },
      3,
      1000,
      { component: 'reportsService', action: 'buscar relatórios mensais', userId }
    ) || [];
  },

  async createOrUpdateMonthlyReport(
    userId: string,
    month: string,
    year: number,
    totalSpent: number
  ) {
    return errorHandler.handleAsync(
      async () => {
        logger.info('Creating/updating monthly report', { userId, month, year, totalSpent });
        
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
          logger.info('Monthly report updated', { reportId: existing.id, userId, month, year });
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
          logger.info('Monthly report created', { reportId: data.id, userId, month, year });
          return data;
        }
      },
      { component: 'reportsService', action: 'criar/atualizar relatório mensal', userId },
      { severity: 'medium', showToast: true }
    );
  },

  async getComparisonsByMonth(userId: string, month: string, year: number) {
    return errorHandler.retry(
      async () => {
        logger.info('Fetching comparisons by month', { userId, month, year });
        
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

        if (error) throw error;

        logger.info('Comparisons by month fetched', { userId, month, year, count: data?.length || 0 });
        return data || [];
      },
      3,
      1000,
      { component: 'reportsService', action: 'buscar comparações do mês', userId, metadata: { month, year } }
    ) || [];
  },

  async updateMonthlyReportById(reportId: string, totalSpent: number) {
    return errorHandler.handleAsync(
      async () => {
        logger.info('Updating monthly report by ID', { reportId, totalSpent });
        
        const { data, error } = await supabase
          .from("monthly_reports")
          .update({ 
            total_spent: totalSpent,
            updated_at: new Date().toISOString()
          })
          .eq("id", reportId)
          .select()
          .single();

        if (error) throw error;

        logger.info('Monthly report updated by ID', { reportId });
        return data;
      },
      { component: 'reportsService', action: 'atualizar relatório por ID', metadata: { reportId } },
      { severity: 'medium', showToast: true }
    );
  },
};
