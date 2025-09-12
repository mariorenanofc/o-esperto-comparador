import { useQuery } from '@tanstack/react-query';
import { storeService } from '@/services/storeService';
import { productService } from '@/services/productService';
import { comparisonService } from '@/services/comparisonService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCachedQuery } from '@/hooks/useQueryCache';
import { useEffect } from 'react';

// Optimized stores hook with longer cache time
export const useOptimizedStores = () => {
  return useQuery({
    queryKey: ['stores'],
    queryFn: storeService.getStores,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Optimized products hook with search support
export const useOptimizedProducts = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['products', searchTerm],
    queryFn: () => searchTerm ? 
      productService.searchProducts(searchTerm) : 
      productService.getProducts(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Optimized user comparisons hook
export const useOptimizedUserComparisons = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userComparisons', user?.id],
    queryFn: () => user ? 
      comparisonService.getUserComparisons(user.id) : 
      Promise.resolve([]),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Optimized daily offers hook
export const useOptimizedDailyOffers = () => {
  return useQuery({
    queryKey: ['dailyOffers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_offers')
        .select('*')
        .eq('status', 'approved')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - more volatile data
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
};

// Data preloader hook for critical resources
export const useDataPreloader = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Preload critical data after initial render
    const preloadData = () => {
      // Use setTimeout to avoid blocking initial render
      setTimeout(() => {
        // Use requestIdleCallback if available for better performance
        const callback = () => {
          // Preload products and stores in background
          productService.getProducts().catch(() => {
            // Silently fail - this is just preloading
          });
          
          storeService.getStores().catch(() => {
            // Silently fail - this is just preloading
          });
        };

        if (window.requestIdleCallback) {
          window.requestIdleCallback(callback);
        } else {
          callback();
        }
      }, 1000);
    };

    preloadData();
  }, []);

  // Preload user-specific data when user logs in
  useEffect(() => {
    if (user) {
      setTimeout(() => {
        comparisonService.getUserComparisons(user.id).catch(() => {
          // Silently fail - this is just preloading
        });
      }, 500);
    }
  }, [user]);
};