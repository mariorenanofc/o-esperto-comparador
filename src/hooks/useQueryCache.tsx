import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

// Cache keys para organizar melhor o cache
export const QUERY_KEYS = {
  user: ['user'],
  comparisons: ['comparisons'],
  stores: ['stores'],
  products: ['products'],
  dailyOffers: ['dailyOffers'],
  reports: ['reports'],
  feedback: ['feedback'],
  adminUsers: ['adminUsers'],
  profile: (userId: string) => ['profile', userId],
  userComparisons: (userId: string) => ['userComparisons', userId],
  storesByLocation: (city: string, state: string) => ['stores', city, state],
  offersByLocation: (city: string, state: string) => ['offers', city, state],
} as const;

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