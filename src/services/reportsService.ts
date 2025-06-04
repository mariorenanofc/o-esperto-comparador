
import { supabaseReportsService } from './supabase/reportsService';

export const reportsService = {
  getUserMonthlyReports: supabaseReportsService.getUserMonthlyReports,
  
  async getMonthlyReport(userId: string, month: string, year: number) {
    const reports = await supabaseReportsService.getUserMonthlyReports(userId);
    return reports.find(r => r.month === month && r.year === year) || null;
  },

  async createMonthlyReport(reportData: { userId: string; month: string; year: number; totalSpent: number }) {
    return await supabaseReportsService.createOrUpdateMonthlyReport(
      reportData.userId,
      reportData.month,
      reportData.year,
      reportData.totalSpent
    );
  },

  async updateMonthlyReport(reportId: string, reportData: { totalSpent: number }) {
    console.log('updateMonthlyReport called with id:', reportId, 'data:', reportData);
    // TODO: Implementar update específico por ID se necessário
    return {} as any;
  },

  getComparisonsByMonth: supabaseReportsService.getComparisonsByMonth,
};
