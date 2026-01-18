import { supabase } from '@/integrations/supabase/client';

// Serviço otimizado usando as novas funções do banco
export const optimizedQueryService = {
  // Busca otimizada de ofertas usando a função do banco
  async searchOffers(params: {
    searchQuery?: string;
    city?: string;
    state?: string;
    limit?: number;
  }) {
    const { data, error } = await supabase.rpc('search_offers_optimized', {
      search_query: params.searchQuery || null,
      city_filter: params.city || null,
      state_filter: params.state || null,
      limit_count: params.limit || 50,
    });

    if (error) {
      console.error('Error searching offers:', error);
      throw error;
    }

    return data || [];
  },

  // Ranking de lojas por cidade usando função otimizada
  async getStoreRanking(city: string, state?: string) {
    const { data, error } = await supabase.rpc('get_store_ranking_by_city', {
      target_city: city,
      target_state: state || null,
    });

    if (error) {
      console.error('Error getting store ranking:', error);
      throw error;
    }

    return data || [];
  },

  // Busca de produtos otimizada
  async searchProducts(params: {
    searchTerm?: string;
    category?: string;
    limit?: number;
  }) {
    const { data, error } = await supabase.rpc('search_products_optimized', {
      search_term: params.searchTerm || null,
      category_filter: params.category || null,
      limit_count: params.limit || 50,
    });

    if (error) {
      console.error('Error searching products:', error);
      throw error;
    }

    return data || [];
  },

  // Estatísticas de ofertas usando materialized view
  async getOfferStats() {
    const { data, error } = await supabase
      .from('mv_offer_stats' as any)
      .select('*')
      .order('total_offers', { ascending: false })
      .limit(20);

    if (error) {
      // Se a view não existir, retorna array vazio
      console.warn('Materialized view not available:', error);
      return [];
    }

    return data || [];
  },

  // Ofertas recentes com paginação eficiente
  async getRecentOffers(params: {
    city?: string;
    state?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('daily_offers')
      .select('*', { count: 'exact' })
      .eq('verified', true)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (params.city) {
      query = query.eq('city', params.city);
    }
    if (params.state) {
      query = query.eq('state', params.state);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching recent offers:', error);
      throw error;
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },

  // Lojas com cache de contagem
  async getStoresWithCount() {
    const { data, error } = await supabase
      .from('stores')
      .select('*, daily_offers(count)')
      .order('name');

    if (error) {
      console.error('Error fetching stores:', error);
      throw error;
    }

    return data || [];
  },

  // Produtos por categoria com contagem
  async getProductsByCategory(category: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('name')
      .limit(100);

    if (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }

    return data || [];
  },

  // Categorias com contagem de produtos
  async getCategoriesWithCount() {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .order('category');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    // Agrupa e conta
    const counts = (data || []).reduce((acc: Record<string, number>, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  },
};
