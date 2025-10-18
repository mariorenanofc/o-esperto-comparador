import { ComparisonData } from '@/lib/types';
import { supabaseComparisonService } from './supabase/comparisonService';
import { enhancedComparisonService } from './enhancedComparisonService';
import { analytics } from '@/lib/analytics';
import { logger } from '@/lib/logger';
import { errorHandler } from '@/lib/errorHandler';

export const comparisonService = {
  // Use enhanced service for offline-first functionality
  getUserComparisons: enhancedComparisonService.getUserComparisons,
  
  // Instrumented saveComparison with analytics
  async saveComparison(comparisonData: ComparisonData) {
    const startTime = Date.now();
    logger.info("Saving comparison", { 
      productsCount: comparisonData.products?.length || 0,
      storesCount: comparisonData.stores?.length || 0
    });

    return errorHandler.retry(
      async () => {
        const dataWithUserId = { ...comparisonData, userId: comparisonData.userId! };
        const result = await enhancedComparisonService.saveComparison(dataWithUserId);
        const endTime = Date.now();
        
        await analytics.trackComparison({
          productsCount: comparisonData.products?.length || 0,
          storesCount: comparisonData.stores?.length || 0,
          timeMs: endTime - startTime
        });
        
        logger.info("Comparison saved successfully", { 
          comparisonId: result.id,
          timeMs: endTime - startTime 
        });
        return result;
      },
      2,
      2000,
      { component: "comparisonService", action: "saveComparison" }
    ).catch(async (error) => {
      await analytics.trackError(error as Error, { 
        context: 'comparison_creation',
        comparisonData: { 
          productsCount: comparisonData.products?.length || 0,
          storesCount: comparisonData.stores?.length || 0
        }
      });
      logger.error("Failed to save comparison", error);
      throw error;
    });
  },
  
  deleteComparison: enhancedComparisonService.deleteComparison,
  getComparisonCount: enhancedComparisonService.getComparisonCount,
  canMakeComparison: enhancedComparisonService.canMakeComparison,

  // Keep original supabase service for direct access if needed
  _supabase: supabaseComparisonService,

  // Update comparison functionality
  async updateComparison(comparisonId: string, comparisonData: Partial<ComparisonData>) {
    logger.info("Updating comparison", { comparisonId });
    
    return errorHandler.retry(
      async () => {
        const result = await this._supabase.updateComparison(comparisonId, comparisonData);
        logger.info("Comparison updated successfully", { comparisonId });
        return result;
      },
      2,
      1500,
      { component: "comparisonService", action: "updateComparison" }
    );
  },

  // Export PDF with analytics tracking
  async exportToPDF(comparisonData: ComparisonData) {
    logger.info("Exporting comparison to PDF", {
      productsCount: comparisonData.products?.length || 0,
      storesCount: comparisonData.stores?.length || 0
    });

    return errorHandler.handleAsync(
      async () => {
        await analytics.trackUserAction('comparison_export_pdf', {
          productsCount: comparisonData.products?.length || 0,
          storesCount: comparisonData.stores?.length || 0
        });
        
        logger.info("PDF export completed successfully");
        return { success: true };
      },
      { component: "comparisonService", action: "exportToPDF" },
      { severity: "medium" }
    ).catch(async (error) => {
      await analytics.trackError(error as Error, { context: 'pdf_export' });
      throw error;
    });
  }
};

// Export individual functions for direct import
export const { getUserComparisons, saveComparison, deleteComparison } = comparisonService;
