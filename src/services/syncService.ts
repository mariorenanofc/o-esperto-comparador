import { offlineStorageService } from './offlineStorageService';
import { comparisonService } from './comparisonService';
import { dailyOffersService } from './dailyOffersService';
import { toast } from 'sonner';

class SyncService {
  private isSyncing = false;

  async syncOfflineData(userId: string): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    this.isSyncing = true;
    console.log('Starting offline data sync...');

    try {
      await this.syncComparisons(userId);
      await this.syncContributions(userId);
      
      offlineStorageService.clearSyncedData();
      offlineStorageService.setLastSyncTime();
      
      toast.success('Dados sincronizados com sucesso!');
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Falha na sincronização. Tentando novamente...');
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncComparisons(userId: string): Promise<void> {
    const unsyncedComparisons = offlineStorageService.getUnsyncedComparisons();
    
    for (const comparison of unsyncedComparisons) {
      try {
        // Convert date string back to Date object for ComparisonData compatibility
        const comparisonForSync = {
          ...comparison,
          date: new Date(comparison.date),
          userId: comparison.userId,
        };
        
        await comparisonService.saveComparison(comparisonForSync);
        offlineStorageService.markComparisonSynced(comparison.id);
        console.log(`Synced comparison: ${comparison.id}`);
      } catch (error) {
        console.error(`Failed to sync comparison ${comparison.id}:`, error);
      }
    }
  }

  private async syncContributions(userId: string): Promise<void> {
    const unsyncedContributions = offlineStorageService.getUnsyncedContributions();
    
    for (const contribution of unsyncedContributions) {
      try {
        await dailyOffersService.submitPriceContribution(
          {
            productName: contribution.productName,
            price: contribution.price,
            storeName: contribution.storeName,
            city: contribution.city,
            state: contribution.state,
            quantity: contribution.quantity,
            unit: contribution.unit,
            userId: userId,
            timestamp: new Date(contribution.timestamp),
            verified: false,
          },
          userId,
          'Usuário' // Default name for offline contributions
        );
        offlineStorageService.markContributionSynced(contribution.id);
        console.log(`Synced contribution: ${contribution.id}`);
      } catch (error) {
        console.error(`Failed to sync contribution ${contribution.id}:`, error);
      }
    }
  }

  hasUnsyncedData(): boolean {
    const unsyncedComparisons = offlineStorageService.getUnsyncedComparisons();
    const unsyncedContributions = offlineStorageService.getUnsyncedContributions();
    return unsyncedComparisons.length > 0 || unsyncedContributions.length > 0;
  }

  getUnsyncedDataCount(): { comparisons: number; contributions: number } {
    return {
      comparisons: offlineStorageService.getUnsyncedComparisons().length,
      contributions: offlineStorageService.getUnsyncedContributions().length,
    };
  }
}

export const syncService = new SyncService();