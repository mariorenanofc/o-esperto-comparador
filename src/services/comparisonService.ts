
import { ComparisonData } from '@/lib/types';
import { supabaseComparisonService } from './supabase/comparisonService';

export const comparisonService = {
  // Usar serviços do Supabase como padrão
  getUserComparisons: supabaseComparisonService.getUserComparisons,
  
  async saveComparison(comparisonData: ComparisonData & { userId: string }) {
    const { userId, ...data } = comparisonData;
    console.log('Saving comparison via service:', userId, data);
    return await supabaseComparisonService.saveComparison(userId, data);
  },

  deleteComparison: supabaseComparisonService.deleteComparison,

  // Manter compatibilidade com API antiga como fallback
  async updateComparison(comparisonId: string, comparisonData: Partial<ComparisonData>) {
    console.log('updateComparison called with id:', comparisonId, 'data:', comparisonData);
    // TODO: Implementar update no Supabase se necessário
    return {} as any;
  },
};
