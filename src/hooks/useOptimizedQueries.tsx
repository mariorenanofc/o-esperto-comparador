import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { QUERY_KEYS } from './useQueryCache';
import { getCacheService } from '@/services/reactiveCache';
import { productService } from '@/services/productService';
import { storeService } from '@/services/storeService';
import { supabaseDailyOffersService } from '@/services/supabase/dailyOffersService';

// Hook otimizado para produtos (sem chamadas duplicadas)
export const useOptimizedProducts = () => {
  const { data: products = [], isLoading, error, isRefetching } = useQuery({
    queryKey: [...QUERY_KEYS.products],
    queryFn: async () => {
      console.log('🔄 Fetching products (optimized)');
      return await productService.getProducts();
    },
    staleTime: 10 * 60 * 1000, // 10 minutos - mais tempo para evitar refetch
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Não refetch se já tem dados
    retry: 1,
  });

  const availableCategories = useMemo(() => {
    const categories = new Set(products.map(product => product.category || 'outros'));
    return Array.from(categories).sort();
  }, [products]);

  return {
    products,
    availableCategories,
    isLoading: isLoading && !isRefetching,
    isRefetching,
    error,
    totalProducts: products.length
  };
};

// Hook otimizado para lojas (sem chamadas duplicadas)
export const useOptimizedStores = () => {
  const { data: stores = [], isLoading, error, isRefetching } = useQuery({
    queryKey: [...QUERY_KEYS.stores],
    queryFn: async () => {
      console.log('🔄 Fetching stores (optimized)');
      return await storeService.getStores();
    },
    staleTime: 15 * 60 * 1000, // 15 minutos - lojas mudam menos
    gcTime: 60 * 60 * 1000, // 1 hora
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  return {
    stores,
    isLoading: isLoading && !isRefetching,
    isRefetching,
    error,
    totalStores: stores.length
  };
};

// Hook otimizado para ofertas diárias
export const useOptimizedDailyOffers = () => {
  const { data: offers = [], isLoading, error } = useQuery({
    queryKey: [...QUERY_KEYS.dailyOffers],
    queryFn: async () => {
      console.log('🔄 Fetching daily offers (optimized)');
      return await supabaseDailyOffersService.getTodaysOffers();
    },
    staleTime: 2 * 60 * 1000, // 2 minutos - ofertas mudam mais frequentemente
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
    retry: 2,
  });

  return {
    offers,
    isLoading,
    error,
    totalOffers: offers.length
  };
};

// Hook para mutações com invalidação inteligente
export const useOptimizedMutations = () => {
  const queryClient = useQueryClient();
  const cacheService = getCacheService();

  // Mutação para criar produto
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      // Implementar lógica de criação
      console.log('Creating product:', productData);
      // return await productService.createProduct(productData);
    },
    onMutate: async (newProduct) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: [...QUERY_KEYS.products] });

      // Snapshot do estado anterior
      const previousProducts = queryClient.getQueryData([...QUERY_KEYS.products]);

      // Atualização otimista
      if (previousProducts) {
        queryClient.setQueryData([...QUERY_KEYS.products], (old: any[]) => [
          ...old,
          { ...newProduct, id: `temp-${Date.now()}`, created_at: new Date().toISOString() }
        ]);
      }

      return { previousProducts };
    },
    onError: (err, newProduct, context) => {
      // Rollback em caso de erro
      if (context?.previousProducts) {
        queryClient.setQueryData([...QUERY_KEYS.products], context.previousProducts);
      }
    },
    onSettled: () => {
      // Invalidação inteligente
      cacheService.invalidateRelated('PRODUCT_CREATED');
    },
  });

  // Mutação para criar loja
  const createStoreMutation = useMutation({
    mutationFn: async (storeData: any) => {
      console.log('Creating store:', storeData);
      // return await storeService.createStore(storeData);
    },
    onMutate: async (newStore) => {
      await queryClient.cancelQueries({ queryKey: [...QUERY_KEYS.stores] });
      const previousStores = queryClient.getQueryData([...QUERY_KEYS.stores]);

      if (previousStores) {
        queryClient.setQueryData([...QUERY_KEYS.stores], (old: any[]) => [
          ...old,
          { ...newStore, id: `temp-${Date.now()}`, created_at: new Date().toISOString() }
        ]);
      }

      return { previousStores };
    },
    onError: (err, newStore, context) => {
      if (context?.previousStores) {
        queryClient.setQueryData([...QUERY_KEYS.stores], context.previousStores);
      }
    },
    onSettled: () => {
      cacheService.invalidateRelated('STORE_CREATED');
    },
  });

  // Mutação para ofertas diárias
  const createOfferMutation = useMutation({
    mutationFn: async ({ contribution, userId, contributorName }: any) => {
      return await supabaseDailyOffersService.submitPriceContribution(
        contribution, 
        userId, 
        contributorName
      );
    },
    onSuccess: () => {
      cacheService.invalidateRelated('DAILY_OFFER_CREATED');
    },
  });

  return {
    createProduct: createProductMutation.mutate,
    createStore: createStoreMutation.mutate,
    createOffer: createOfferMutation.mutate,
    isCreatingProduct: createProductMutation.isPending,
    isCreatingStore: createStoreMutation.isPending,
    isCreatingOffer: createOfferMutation.isPending,
  };
};

// Hook para prefetch inteligente
export const useSmartPrefetch = () => {
  const cacheService = getCacheService();

  const prefetchProducts = useCallback(async () => {
    await cacheService.prefetchIfStale(
      [...QUERY_KEYS.products],
      () => productService.getProducts(),
      10 * 60 * 1000 // 10 minutos
    );
  }, [cacheService]);

  const prefetchStores = useCallback(async () => {
    await cacheService.prefetchIfStale(
      [...QUERY_KEYS.stores],
      () => storeService.getStores(),
      15 * 60 * 1000 // 15 minutos
    );
  }, [cacheService]);

  const prefetchOffers = useCallback(async () => {
    await cacheService.prefetchIfStale(
      [...QUERY_KEYS.dailyOffers],
      () => supabaseDailyOffersService.getTodaysOffers(),
      2 * 60 * 1000 // 2 minutos
    );
  }, [cacheService]);

  return {
    prefetchProducts,
    prefetchStores,
    prefetchOffers
  };
};

// Hook para stats de cache
export const useCacheStats = () => {
  const queryClient = useQueryClient();

  const stats = useMemo(() => {
    const queries = queryClient.getQueryCache().getAll();
    const totalQueries = queries.length;
    const staleQueries = queries.filter(q => q.isStale()).length;
    const fetchingQueries = queries.filter(q => q.state.fetchStatus === 'fetching').length;
    
    return {
      totalQueries,
      staleQueries,
      fetchingQueries,
      cacheHitRate: totalQueries > 0 ? ((totalQueries - staleQueries) / totalQueries * 100).toFixed(1) : '0'
    };
  }, [queryClient]);

  return stats;
};