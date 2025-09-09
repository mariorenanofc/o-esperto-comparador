
import { ComparisonData } from '@/lib/types';
import { supabaseComparisonService } from './supabase/comparisonService';
import { enhancedComparisonService } from './enhancedComparisonService';
import { analytics } from '@/lib/analytics';

export const comparisonService = {
  // Use enhanced service for offline-first functionality
  getUserComparisons: enhancedComparisonService.getUserComparisons,
  
  // Instrumented saveComparison with analytics
  async saveComparison(comparisonData: ComparisonData) {
    const startTime = Date.now();
    try {
      // Ensure userId is set for enhanced service
      const dataWithUserId = { ...comparisonData, userId: comparisonData.userId! };
      const result = await enhancedComparisonService.saveComparison(dataWithUserId);
      const endTime = Date.now();
      
      // Track comparison creation
      await analytics.trackComparison({
        productsCount: comparisonData.products?.length || 0,
        storesCount: comparisonData.stores?.length || 0,
        timeMs: endTime - startTime
      });
      
      return result;
    } catch (error) {
      await analytics.trackError(error as Error, { 
        context: 'comparison_creation',
        comparisonData: { 
          productsCount: comparisonData.products?.length || 0,
          storesCount: comparisonData.stores?.length || 0
        }
      });
      throw error;
    }
  },
  
  deleteComparison: enhancedComparisonService.deleteComparison,
  getComparisonCount: enhancedComparisonService.getComparisonCount,
  canMakeComparison: enhancedComparisonService.canMakeComparison,

  // Keep original supabase service for direct access if needed
  _supabase: supabaseComparisonService,

  // Update comparison functionality
  async updateComparison(comparisonId: string, comparisonData: Partial<ComparisonData>) {
    try {
      return await this._supabase.updateComparison(comparisonId, comparisonData);
    } catch (error) {
      throw new Error(`Failed to update comparison: ${error}`);
    }
  },

  // Export PDF with analytics tracking
  async exportToPDF(comparisonData: ComparisonData) {
    try {
      await analytics.trackUserAction('comparison_export_pdf', {
        productsCount: comparisonData.products?.length || 0,
        storesCount: comparisonData.stores?.length || 0
      });
      
      // PDF export logic would go here
      return { success: true };
    } catch (error) {
      await analytics.trackError(error as Error, { context: 'pdf_export' });
      throw error;
    }
  }
};

// Export individual functions for direct import
export const { getUserComparisons, saveComparison, deleteComparison } = comparisonService;
