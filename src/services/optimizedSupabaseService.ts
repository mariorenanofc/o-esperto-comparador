import { supabase } from "@/integrations/supabase/client";

// Service otimizado para queries do Supabase com cache estratégico
export class OptimizedSupabaseService {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  // Cache com TTL personalizado
  private static setCache(key: string, data: any, ttlMinutes = 5) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  }

  private static getCache(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Buscar stores com cache otimizado
  static async getStores(): Promise<any[]> {
    const cacheKey = `stores_all`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao buscar stores:', error);
        return [];
      }

      const result = data || [];
      
      // Cache por 10 minutos para stores
      this.setCache(cacheKey, result, 10);
      return result;
    } catch (error) {
      console.error('Erro ao buscar stores:', error);
      return [];
    }
  }

  // Buscar produtos com cache otimizado
  static async getProducts(searchTerm?: string): Promise<any[]> {
    const cacheKey = `products_${searchTerm || 'all'}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
      }

      const result = data || [];
      
      // Cache por 15 minutos para produtos
      this.setCache(cacheKey, result, 15);
      return result;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  }

  // Limpar cache específico
  static clearCache(pattern?: string) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Preload de dados críticos
  static async preloadCriticalData() {
    const promises = [
      this.getStores(), // Carrega todos os stores
      this.getProducts(), // Carrega produtos populares
    ];

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.warn('Erro no preload de dados:', error);
    }
  }
}