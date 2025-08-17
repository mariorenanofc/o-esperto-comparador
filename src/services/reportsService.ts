
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
    try {
      return await supabaseReportsService.updateMonthlyReportById(reportId, reportData.totalSpent);
    } catch (error) {
      throw new Error(`Failed to update monthly report: ${error}`);
    }
  },

  getComparisonsByMonth: supabaseReportsService.getComparisonsByMonth,
};
