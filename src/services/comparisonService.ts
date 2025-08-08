
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

  // Manter compatibilidade com API antiga como fallback
  async updateComparison(comparisonId: string, comparisonData: Partial<ComparisonData>) {
    console.log('updateComparison called with id:', comparisonId, 'data:', comparisonData);
    // TODO: Implementar update no Supabase se necessário
    return {} as any;
  },
};
