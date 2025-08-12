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
  static async getStores(city?: string, state?: string): Promise<any[]> {
    const cacheKey = `stores_${city || 'all'}_${state || 'all'}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      // Usar fetch direto para evitar problemas de tipos
      const url = new URL('/rest/v1/stores', 'https://diqdsmrlhldanxxrtozl.supabase.co');
      url.searchParams.set('select', '*');
      url.searchParams.set('is_active', 'eq.true');
      url.searchParams.set('order', 'name');
      
      if (city && state) {
        url.searchParams.set('city', `eq.${city}`);
        url.searchParams.set('state', `eq.${state}`);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpcWRzbXJsaGxkYW54eHJ0b3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMzg2NzYsImV4cCI6MjA2NDYxNDY3Nn0.5btkbuhvf0CLye5pQh7bp8cmihJcMTChMlclBKRaNmY',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpcWRzbXJsaGxkYW54eHJ0b3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMzg2NzYsImV4cCI6MjA2NDYxNDY3Nn0.5btkbuhvf0CLye5pQh7bp8cmihJcMTChMlclBKRaNmY',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      const result = Array.isArray(data) ? data : [];
      
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
      const url = new URL('/rest/v1/products', 'https://diqdsmrlhldanxxrtozl.supabase.co');
      url.searchParams.set('select', '*');
      url.searchParams.set('is_active', 'eq.true');
      url.searchParams.set('order', 'name');
      
      if (searchTerm) {
        url.searchParams.set('name', `ilike.%${searchTerm}%`);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpcWRzbXJsaGxkYW54eHJ0b3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMzg2NzYsImV4cCI6MjA2NDYxNDY3Nn0.5btkbuhvf0CLye5pQh7bp8cmihJcMTChMlclBKRaNmY',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpcWRzbXJsaGxkYW54eHJ0b3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMzg2NzYsImV4cCI6MjA2NDYxNDY3Nn0.5btkbuhvf0CLye5pQh7bp8cmihJcMTChMlclBKRaNmY',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      const result = Array.isArray(data) ? data : [];
      
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
  static async preloadCriticalData(userId?: string) {
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