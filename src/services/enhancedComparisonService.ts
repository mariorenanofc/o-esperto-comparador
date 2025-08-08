import { ComparisonData } from '@/lib/types';
import { supabaseComparisonService } from './supabase/comparisonService';
import { offlineStorageService, OfflineComparison } from './offlineStorageService';
import { useOffline } from '@/hooks/useOffline';

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
      }
    }
    
    // Save offline
    const timestamp = Date.now();
    const offlineComparison: OfflineComparison = {
      ...data,
      date: data.date?.toISOString() || new Date(timestamp).toISOString(), // Convert Date to string
      id: `offline_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      user_id: userId, // For compatibility
      title: `Comparação ${new Date().toLocaleDateString()}`,
      created_at: new Date(timestamp).toISOString(),
      updated_at: new Date(timestamp).toISOString(),
      timestamp,
      synced: false,
      comparison_products: [],
      prices: [],
    };
    
    offlineStorageService.saveOfflineComparison(offlineComparison);
    console.log('Comparison saved offline successfully');
    
    return offlineComparison;
  },

  // Delete comparison
  async deleteComparison(comparisonId: string) {
    if (comparisonId.startsWith('offline_')) {
      // Remove from offline storage
      const comparisons = offlineStorageService.getOfflineComparisons();
      const filtered = comparisons.filter(comp => comp.id !== comparisonId);
      localStorage.setItem('offline_comparisons', JSON.stringify(filtered));
      console.log('Offline comparison removed');
      return;
    }
    
    if (navigator.onLine) {
      try {
        await supabaseComparisonService.deleteComparison(comparisonId);
        console.log('Comparison deleted successfully');
      } catch (error) {
        console.error('Failed to delete online:', error);
      }
    } else {
      console.log('Cannot delete online comparisons when offline');
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