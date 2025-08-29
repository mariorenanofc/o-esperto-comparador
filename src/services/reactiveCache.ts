import { QueryClient } from '@tanstack/react-query';

// Cache reativo com invalidação inteligente
export class ReactiveCacheService {
  private queryClient: QueryClient;
  private subscribers: Map<string, Set<() => void>> = new Map();

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  // Invalidação inteligente baseada em relações
  async invalidateRelated(action: string, data?: any) {
    console.log(`🔄 Cache invalidation for action: ${action}`, data);

    switch (action) {
      case 'COMPARISON_CREATED':
      case 'COMPARISON_UPDATED':
      case 'COMPARISON_DELETED':
        // Invalidar comparações do usuário
        await this.queryClient.invalidateQueries({ queryKey: ['comparisons'] });
        await this.queryClient.invalidateQueries({ queryKey: ['userComparisons'] });
        // Invalidar relatórios que dependem de comparações
        await this.queryClient.invalidateQueries({ queryKey: ['reports'] });
        break;

      case 'PRODUCT_CREATED':
      case 'PRODUCT_UPDATED':
        // Invalidar produtos e buscas
        await this.queryClient.invalidateQueries({ queryKey: ['products'] });
        // Manter cache de categorias se não mudou a categoria
        if (!data?.categoryChanged) {
          // Só invalida a categoria específica
          if (data?.category) {
            await this.queryClient.invalidateQueries({ 
              queryKey: ['products', 'category', data.category] 
            });
          }
        } else {
          // Invalidar todas as categorias
          await this.queryClient.invalidateQueries({ 
            queryKey: ['products', 'category'] 
          });
        }
        break;

      case 'STORE_CREATED':
      case 'STORE_UPDATED':
        // Invalidar lojas
        await this.queryClient.invalidateQueries({ queryKey: ['stores'] });
        break;

      case 'DAILY_OFFER_CREATED':
      case 'DAILY_OFFER_APPROVED':
      case 'DAILY_OFFER_REJECTED':
        // Invalidar ofertas públicas
        await this.queryClient.invalidateQueries({ queryKey: ['dailyOffers'] });
        await this.queryClient.invalidateQueries({ queryKey: ['offers'] });
        break;

      case 'PROFILE_UPDATED':
        // Invalidar perfil específico
        if (data?.userId) {
          await this.queryClient.invalidateQueries({ 
            queryKey: ['profile', data.userId] 
          });
        }
        break;

      case 'USER_LOCATION_CHANGED':
        // Invalidar dados baseados em localização
        await this.queryClient.invalidateQueries({ 
          queryKey: ['stores', data?.city, data?.state] 
        });
        await this.queryClient.invalidateQueries({ 
          queryKey: ['offers', data?.city, data?.state] 
        });
        break;

      default:
        console.warn(`Unknown cache invalidation action: ${action}`);
    }

    // Notificar subscribers
    this.notifySubscribers(action);
  }

  // Otimização de queries - evitar duplicatas
  async optimisticUpdate<T>(
    queryKey: (string | number)[],
    updater: (old: T | undefined) => T,
    rollback?: () => void
  ) {
    const previousData = this.queryClient.getQueryData<T>(queryKey);
    
    try {
      // Atualização otimista
      this.queryClient.setQueryData(queryKey, updater);
      return previousData;
    } catch (error) {
      // Rollback em caso de erro
      if (rollback) {
        rollback();
      } else if (previousData !== undefined) {
        this.queryClient.setQueryData(queryKey, previousData);
      }
      throw error;
    }
  }

  // Prefetch inteligente
  async prefetchIfStale(
    queryKey: (string | number)[],
    queryFn: () => Promise<any>,
    staleTimeMs: number = 5 * 60 * 1000
  ) {
    const queryState = this.queryClient.getQueryState(queryKey);
    
    if (!queryState || 
        !queryState.dataUpdatedAt || 
        Date.now() - queryState.dataUpdatedAt > staleTimeMs) {
      
      console.log(`🚀 Prefetching stale data for:`, queryKey);
      await this.queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: staleTimeMs,
      });
    }
  }

  // Subscribe para mudanças no cache
  subscribe(action: string, callback: () => void) {
    if (!this.subscribers.has(action)) {
      this.subscribers.set(action, new Set());
    }
    this.subscribers.get(action)!.add(callback);

    // Retorna função de unsubscribe
    return () => {
      this.subscribers.get(action)?.delete(callback);
    };
  }

  private notifySubscribers(action: string) {
    this.subscribers.get(action)?.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error(`Error in cache subscriber for ${action}:`, error);
      }
    });
  }

  // Limpeza de cache antigo
  async cleanupStaleCache() {
    console.log('🧹 Cleaning up stale cache...');
    
    // Remove queries mais antigas que 1 hora
    this.queryClient.clear();
    
    // Mais específico: remover apenas dados muito antigos
    const staleTime = 60 * 60 * 1000; // 1 hora
    const queries = this.queryClient.getQueryCache().getAll();
    
    queries.forEach(query => {
      const lastUpdated = query.state.dataUpdatedAt || 0;
      if (Date.now() - lastUpdated > staleTime) {
        this.queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
  }

  // Reset cache completo (em caso de erro crítico)
  async resetCache() {
    console.log('🔄 Resetting entire cache...');
    await this.queryClient.clear();
    await this.queryClient.resetQueries();
  }

  // Batching de invalidações para performance
  private invalidationQueue: Set<string> = new Set();
  private invalidationTimeout: NodeJS.Timeout | null = null;

  queueInvalidation(action: string, data?: any) {
    this.invalidationQueue.add(JSON.stringify({ action, data }));
    
    if (this.invalidationTimeout) {
      clearTimeout(this.invalidationTimeout);
    }

    this.invalidationTimeout = setTimeout(() => {
      this.processBatchedInvalidations();
    }, 100); // 100ms de batching
  }

  private async processBatchedInvalidations() {
    const items = Array.from(this.invalidationQueue).map(item => JSON.parse(item));
    this.invalidationQueue.clear();
    
    console.log(`🔄 Processing ${items.length} batched invalidations`);
    
    for (const { action, data } of items) {
      await this.invalidateRelated(action, data);
    }
  }
}

// Instância global do cache service
let cacheService: ReactiveCacheService | null = null;

export const initializeCacheService = (queryClient: QueryClient) => {
  if (!cacheService) {
    cacheService = new ReactiveCacheService(queryClient);
  }
  return cacheService;
};

export const getCacheService = (): ReactiveCacheService => {
  if (!cacheService) {
    throw new Error('Cache service not initialized. Call initializeCacheService first.');
  }
  return cacheService;
};