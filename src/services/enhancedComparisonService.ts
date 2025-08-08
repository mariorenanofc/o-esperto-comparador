import { ComparisonData } from '@/lib/types';
import { supabaseComparisonService } from './supabase/comparisonService';
import { offlineStorageService, OfflineComparison } from './offlineStorageService';
import { useOffline } from '@/hooks/useOffline';
import { toast } from 'sonner';

export const enhancedComparisonService = {
  // Get comparisons (online + offline)
  async getUserComparisons(userId: string) {
    try {
      const onlineComparisons = await supabaseComparisonService.getUserComparisons(userId);
      const offlineComparisons = offlineStorageService.getOfflineComparisons()
        .filter(comp => comp.userId === userId);
      
      return [...onlineComparisons, ...offlineComparisons];
    } catch (error) {
      console.error('Error getting comparisons, falling back to offline only:', error);
      const offlineComparisons = offlineStorageService.getOfflineComparisons()
        .filter(comp => comp.userId === userId);
      return offlineComparisons;
    }
  },
  
  // Save comparison (offline-first)
  async saveComparison(comparisonData: ComparisonData & { userId: string }) {
    const { userId, ...data } = comparisonData;
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      try {
        const result = await supabaseComparisonService.saveComparison(userId, data);
        console.log('Comparison saved online successfully');
        return result;
      } catch (error) {
        console.error('Failed to save online, saving offline:', error);
        toast.warning('Conexão instável. Salvando offline...');
      }
    }
    
    // Save offline
    const offlineComparison: OfflineComparison = {
      ...data,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      timestamp: Date.now(),
      synced: false,
    };
    
    offlineStorageService.saveOfflineComparison(offlineComparison);
    
    if (!isOnline) {
      toast.info('Comparação salva offline. Será sincronizada quando voltar online.');
    } else {
      toast.success('Comparação salva offline devido a problema de conexão.');
    }
    
    return offlineComparison;
  },

  // Delete comparison
  async deleteComparison(comparisonId: string) {
    const isOnline = navigator.onLine;
    
    if (comparisonId.startsWith('offline_')) {
      // Remove from offline storage
      const comparisons = offlineStorageService.getOfflineComparisons();
      const filtered = comparisons.filter(comp => comp.id !== comparisonId);
      localStorage.setItem('offline_comparisons', JSON.stringify(filtered));
      toast.success('Comparação removida');
      return;
    }
    
    if (isOnline) {
      try {
        await supabaseComparisonService.deleteComparison(comparisonId);
        toast.success('Comparação removida');
      } catch (error) {
        console.error('Failed to delete online:', error);
        toast.error('Falha ao remover comparação. Tente novamente.');
      }
    } else {
      toast.error('Não é possível remover comparações online quando offline.');
    }
  },

  // Get comparison count for subscription limits
  getComparisonCount(): number {
    return offlineStorageService.getComparisonCount();
  },

  // Check if user can make more comparisons
  canMakeComparison(userPlan: string, monthlyLimit: number): boolean {
    const currentCount = this.getComparisonCount();
    
    if (userPlan === 'premium') {
      return true; // Premium users have unlimited comparisons
    }
    
    return currentCount < monthlyLimit;
  },
};