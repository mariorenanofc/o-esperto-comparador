
import { ComparisonData } from '@/lib/types';
import { supabaseComparisonService } from './supabase/comparisonService';
import { enhancedComparisonService } from './enhancedComparisonService';

export const comparisonService = {
  // Use enhanced service for offline-first functionality
  getUserComparisons: enhancedComparisonService.getUserComparisons,
  saveComparison: enhancedComparisonService.saveComparison,
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
};
