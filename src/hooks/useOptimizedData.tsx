import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { DailyOffer } from '@/lib/types';
import { CACHE_CONFIGS } from '@/lib/queryConfig';

// Optimized stores hook with direct Supabase call
export const useOptimizedStores = () => {
  return useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching stores:", error);
        throw error;
      }

      return data || [];
    },
    ...CACHE_CONFIGS.semiStatic,
  });
};

// Optimized products hook with direct Supabase call
export const useOptimizedProducts = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['products', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*");

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query.order("name");

      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }

      return data || [];
    },
    ...CACHE_CONFIGS.semiStatic,
  });
};

// Optimized user comparisons hook  
export const useOptimizedUserComparisons = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userComparisons', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('comparisons')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching user comparisons:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
    ...CACHE_CONFIGS.dynamic,
  });
};

// Optimized daily offers hook - Retorna dados já mapeados para DailyOffer
export const useOptimizedDailyOffers = () => {
  return useQuery<DailyOffer[]>({
    queryKey: ['dailyOffers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_offers')
        .select('*')
        .eq('verified', true)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Mapear para o formato DailyOffer
      return (data || []).map(item => ({
        id: item.id,
        productName: item.product_name,
        price: Number(item.price),
        storeName: item.store_name,
        city: item.city,
        state: item.state,
        contributorName: item.contributor_name || 'Anônimo',
        userId: item.user_id,
        timestamp: new Date(item.created_at || ''),
        verified: item.verified || false,
        quantity: item.quantity || 1,
        unit: item.unit || 'unidade'
      }));
    },
    staleTime: CACHE_CONFIGS.volatile.staleTime,
    gcTime: CACHE_CONFIGS.volatile.gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Evitar refetch no mount
    refetchInterval: CACHE_CONFIGS.volatile.refetchInterval,
    retry: 2,
  });
};

// Simplified data preloader hook using queryClient
export const useDataPreloader = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Preload critical data after initial render
    const preloadData = async () => {
      setTimeout(async () => {
        // Usar prefetchQuery para integrar com o cache
        queryClient.prefetchQuery({
          queryKey: ['stores'],
          queryFn: async () => {
            const { data } = await supabase.from("stores").select("*").order("name");
            return data || [];
          },
          staleTime: CACHE_CONFIGS.semiStatic.staleTime,
        });
        
        queryClient.prefetchQuery({
          queryKey: ['products'],
          queryFn: async () => {
            const { data } = await supabase.from("products").select("*").order("name");
            return data || [];
          },
          staleTime: CACHE_CONFIGS.semiStatic.staleTime,
        });
      }, 1000);
    };

    preloadData();
  }, [queryClient]);

  // Preload user-specific data when user logs in
  useEffect(() => {
    if (user) {
      const preloadUserData = async () => {
        setTimeout(async () => {
          queryClient.prefetchQuery({
            queryKey: ['userComparisons', user.id],
            queryFn: async () => {
              const { data } = await supabase
                .from('comparisons')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
              return data || [];
            },
            staleTime: CACHE_CONFIGS.dynamic.staleTime,
          });
        }, 500);
      };
      
      preloadUserData();
    }
  }, [user, queryClient]);
};
