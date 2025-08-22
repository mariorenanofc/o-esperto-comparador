import { useEffect } from 'react';
import { useCachedQuery, QUERY_KEYS } from './useQueryCache';
import { productService } from '@/services/productService';
import { storeService } from '@/services/storeService';
import { useAuth } from './useAuth';

// Hook para buscar stores com cache otimizado
export const useOptimizedStores = () => {
  return useCachedQuery(
    QUERY_KEYS.stores,
    () => storeService.getStores(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutos
      enabled: true,
    }
  );
};

// Hook para buscar produtos com cache otimizado
export const useOptimizedProducts = (searchTerm?: string) => {
  return useCachedQuery(
    searchTerm ? ['products', 'search', searchTerm] : QUERY_KEYS.products,
    () => searchTerm ? productService.searchProducts(searchTerm) : productService.getProducts(),
    {
      staleTime: 15 * 60 * 1000, // 15 minutos
      enabled: true,
    }
  );
};

// Hook para buscar comparações do usuário com cache otimizado
export const useOptimizedUserComparisons = (page = 0, limit = 10) => {
  const { user } = useAuth();
  
  return useCachedQuery(
    QUERY_KEYS.userComparisons(user?.id || 'anonymous'),
    async () => {
      // Implementação temporária usando service existente
      return [];
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      enabled: !!user?.id,
    }
  );
};

// Hook para buscar ofertas diárias com cache otimizado
export const useOptimizedDailyOffers = () => {
  return useCachedQuery(
    ['daily-offers'],
    async () => {
      // Implementação temporária usando service existente
      return [];
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutos (dados mais voláteis)
      enabled: true,
    }
  );
};

// Hook para preload de dados críticos
export const useDataPreloader = () => {
  const { user } = useAuth();

  useEffect(() => {
  // Preload após 1 segundo para não bloquear a renderização inicial
    const timeoutId = setTimeout(() => {
      Promise.allSettled([
        productService.getProducts(),
        storeService.getStores()
      ]);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [user?.id]);

  // Preload em idle callback se disponível
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const idleId = (window as any).requestIdleCallback(() => {
        Promise.allSettled([
          productService.getProducts(),
          storeService.getStores()
        ]);
      }, { timeout: 5000 });

      return () => {
        if ('cancelIdleCallback' in window) {
          (window as any).cancelIdleCallback(idleId);
        }
      };
    }
  }, [user?.id]);
};