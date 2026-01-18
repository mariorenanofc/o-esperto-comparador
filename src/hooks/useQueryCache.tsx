import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { QUERY_KEYS as CENTRALIZED_QUERY_KEYS, CACHE_CONFIGS, getQueryConfig } from '@/lib/queryConfig';

// Re-export das chaves de query centralizadas
export { CACHE_CONFIGS, getQueryConfig };

// Chaves de query legadas para compatibilidade
export const QUERY_KEYS = {
  user: ['user'] as const,
  comparisons: ['comparisons'] as const,
  stores: CENTRALIZED_QUERY_KEYS.stores.all,
  products: CENTRALIZED_QUERY_KEYS.products.all,
  dailyOffers: CENTRALIZED_QUERY_KEYS.offers.daily(),
  reports: ['reports'] as const,
  feedback: ['feedback'] as const,
  adminUsers: ['adminUsers'] as const,
  profile: (userId: string) => ['profile', userId] as const,
  userComparisons: (userId: string) => ['userComparisons', userId] as const,
  storesByLocation: (city: string, state: string) => ['stores', city, state] as const,
  offersByLocation: (city: string, state: string) => ['offers', city, state] as const,
};

// Hook para gerenciar cache de queries
export const useQueryCache = () => {
  const queryClient = useQueryClient();

  const invalidateQueries = useCallback((keys: readonly string[]) => {
    queryClient.invalidateQueries({ queryKey: keys });
  }, [queryClient]);

  const removeQueries = useCallback((keys: readonly string[]) => {
    queryClient.removeQueries({ queryKey: keys });
  }, [queryClient]);

  const setQueryData = useCallback((keys: readonly string[], data: any) => {
    queryClient.setQueryData(keys, data);
  }, [queryClient]);

  const getQueryData = useCallback((keys: readonly string[]) => {
    return queryClient.getQueryData(keys);
  }, [queryClient]);

  const prefetchQuery = useCallback(async (keys: readonly string[], queryFn: () => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey: keys,
      queryFn,
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  }, [queryClient]);

  return {
    invalidateQueries,
    removeQueries,
    setQueryData,
    getQueryData,
    prefetchQuery,
  };
};

// Hook customizado para queries com cache otimizado
export const useCachedQuery = <T,>(
  queryKey: readonly string[],
  queryFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    cacheTime?: number;
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutos por padrão
    gcTime: options?.cacheTime ?? 10 * 60 * 1000, // 10 minutos por padrão
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};