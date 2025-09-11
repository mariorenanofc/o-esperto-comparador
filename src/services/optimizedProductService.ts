import { supabase } from "@/integrations/supabase/client";
import { secureLog } from "@/lib/security";

export interface OptimizedProductSearch {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  created_at: string;
  similarity_score?: number;
}

export interface OffersByLocation {
  id: string;
  product_name: string;
  store_name: string;
  price: number;
  city: string;
  state: string;
  created_at: string;
  contributor_name: string;
  quantity: number;
  unit: string;
}

export const optimizedProductService = {
  /**
   * Busca otimizada de produtos com fuzzy search
   */
  async searchProducts(
    searchTerm: string, 
    category?: string, 
    limit: number = 100
  ): Promise<OptimizedProductSearch[]> {
    console.time('🔍 Product Search');
    
    try {
      const { data, error } = await supabase
        .rpc("search_products_optimized", {
          search_term: searchTerm?.trim() || null,
          category_filter: category || null,
          limit_count: limit
        });

      if (error) {
        console.error("Error in optimized product search:", error);
        throw error;
      }

      secureLog(`✅ Found ${data?.length || 0} products for search: "${searchTerm}"`);
      return data || [];
    } finally {
      console.timeEnd('🔍 Product Search');
    }
  },

  /**
   * Busca produtos por categoria otimizada
   */
  async getProductsByCategory(category: string, limit: number = 100): Promise<OptimizedProductSearch[]> {
    return this.searchProducts("", category, limit);
  },

  /**
   * Busca todas as categorias disponíveis (com cache)
   */
  async getCategories(): Promise<string[]> {
    console.time('📋 Categories Fetch');
    
    try {
      const { data, error } = await supabase
        .from("products")
        .select("category")
        .not("category", "is", null);

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }

      const categories = [...new Set(data?.map(item => item.category) || [])].sort();
      secureLog(`✅ Found ${categories.length} categories`);
      return categories;
    } finally {
      console.timeEnd('📋 Categories Fetch');
    }
  }
};

export const optimizedOffersService = {
  /**
   * Busca ofertas otimizada por localização
   */
  async getOffersByLocation(
    city?: string,
    state?: string,
    hoursBack: number = 24
  ): Promise<OffersByLocation[]> {
    console.time('🎯 Offers by Location');
    
    try {
      const { data, error } = await supabase
        .rpc("get_offers_by_location", {
          city_param: city || null,
          state_param: state || null,
          hours_back: hoursBack
        });

      if (error) {
        console.error("Error fetching offers by location:", error);
        throw error;
      }

      secureLog(`✅ Found ${data?.length || 0} offers for ${city || 'all cities'}, ${state || 'all states'}`);
      return data || [];
    } finally {
      console.timeEnd('🎯 Offers by Location');
    }
  },

  /**
   * Busca ofertas recentes (últimas 24h por padrão)
   */
  async getRecentOffers(hoursBack: number = 24): Promise<OffersByLocation[]> {
    return this.getOffersByLocation(undefined, undefined, hoursBack);
  }
};