import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

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
    staleTime: 10 * 60 * 1000, // 10 minutes
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
    staleTime: 15 * 60 * 1000, // 15 minutes
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Optimized daily offers hook
export const useOptimizedDailyOffers = () => {
  return useQuery({
    queryKey: ['dailyOffers'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('daily_offers')
          .select('*')
          .eq('verified', true)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching daily offers:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - more volatile data
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
};

// Simplified data preloader hook
export const useDataPreloader = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Preload critical data after initial render
    const preloadData = async () => {
      setTimeout(async () => {
        try {
          // Preload stores - fire and forget
          await supabase.from("stores").select("*").order("name");
        } catch {
          // Silently fail - this is just preloading
        }
        
        try {
          // Preload products - fire and forget  
          await supabase.from("products").select("*").order("name");
        } catch {
          // Silently fail - this is just preloading
        }
      }, 1000);
    };

    preloadData();
  }, []);

  // Preload user-specific data when user logs in
  useEffect(() => {
    if (user) {
      const preloadUserData = async () => {
        setTimeout(async () => {
          try {
            await supabase
              .from('comparisons')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });
          } catch {
            // Silently fail - this is just preloading
          }
        }, 500);
      };
      
      preloadUserData();
    }
  }, [user]);
};