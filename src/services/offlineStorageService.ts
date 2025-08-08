import { ComparisonData } from '@/lib/types';

const STORAGE_KEYS = {
  OFFLINE_COMPARISONS: 'offline_comparisons',
  OFFLINE_CONTRIBUTIONS: 'offline_contributions',
  COMPARISON_COUNT: 'comparison_count',
  LAST_SYNC: 'last_sync',
};

export interface OfflineComparison extends Omit<ComparisonData, 'date'> {
  id: string;
  userId: string;
  user_id: string; // Add for compatibility
  title: string;
  date: string; // Override as string for compatibility
  created_at: string; // Add for compatibility  
  updated_at: string; // Add for compatibility
  timestamp: number;
  synced: boolean;
  comparison_products: any[]; // Required for compatibility
  prices: any[]; // Required for compatibility
}

export interface OfflineContribution {
  id: string;
  userId: string;
  productName: string;
  price: number;
  storeName: string;
  city: string;
  state: string;
  quantity: number;
  unit: string;
  timestamp: number;
  synced: boolean;
}

class OfflineStorageService {
  // Comparison methods
  saveOfflineComparison(comparison: OfflineComparison): void {
    const existing = this.getOfflineComparisons();
    const updated = [...existing, comparison];
    localStorage.setItem(STORAGE_KEYS.OFFLINE_COMPARISONS, JSON.stringify(updated));
    
    // Update local comparison count
    this.incrementComparisonCount();
  }

  getOfflineComparisons(): OfflineComparison[] {
    const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_COMPARISONS);
    return data ? JSON.parse(data) : [];
  }

  markComparisonSynced(id: string): void {
    const comparisons = this.getOfflineComparisons();
    const updated = comparisons.map(comp => 
      comp.id === id ? { ...comp, synced: true } : comp
    );
    localStorage.setItem(STORAGE_KEYS.OFFLINE_COMPARISONS, JSON.stringify(updated));
  }

  getUnsyncedComparisons(): OfflineComparison[] {
    return this.getOfflineComparisons().filter(comp => !comp.synced);
  }

  // Contribution methods
  saveOfflineContribution(contribution: OfflineContribution): void {
    const existing = this.getOfflineContributions();
    const updated = [...existing, contribution];
    localStorage.setItem(STORAGE_KEYS.OFFLINE_CONTRIBUTIONS, JSON.stringify(updated));
  }

  getOfflineContributions(): OfflineContribution[] {
    const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_CONTRIBUTIONS);
    return data ? JSON.parse(data) : [];
  }

  markContributionSynced(id: string): void {
    const contributions = this.getOfflineContributions();
    const updated = contributions.map(contrib => 
      contrib.id === id ? { ...contrib, synced: true } : contrib
    );
    localStorage.setItem(STORAGE_KEYS.OFFLINE_CONTRIBUTIONS, JSON.stringify(updated));
  }

  getUnsyncedContributions(): OfflineContribution[] {
    return this.getOfflineContributions().filter(contrib => !contrib.synced);
  }

  // Comparison count methods
  getComparisonCount(): number {
    const count = localStorage.getItem(STORAGE_KEYS.COMPARISON_COUNT);
    return count ? parseInt(count, 10) : 0;
  }

  incrementComparisonCount(): void {
    const current = this.getComparisonCount();
    localStorage.setItem(STORAGE_KEYS.COMPARISON_COUNT, (current + 1).toString());
  }

  setComparisonCount(count: number): void {
    localStorage.setItem(STORAGE_KEYS.COMPARISON_COUNT, count.toString());
  }

  // Sync methods
  setLastSyncTime(): void {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
  }

  getLastSyncTime(): number {
    const time = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return time ? parseInt(time, 10) : 0;
  }

  // Cleanup methods
  clearSyncedData(): void {
    const comparisons = this.getOfflineComparisons().filter(comp => !comp.synced);
    const contributions = this.getOfflineContributions().filter(contrib => !contrib.synced);
    
    localStorage.setItem(STORAGE_KEYS.OFFLINE_COMPARISONS, JSON.stringify(comparisons));
    localStorage.setItem(STORAGE_KEYS.OFFLINE_CONTRIBUTIONS, JSON.stringify(contributions));
  }

  clearAllOfflineData(): void {
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_COMPARISONS);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_CONTRIBUTIONS);
    localStorage.removeItem(STORAGE_KEYS.COMPARISON_COUNT);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
  }
}

export const offlineStorageService = new OfflineStorageService();