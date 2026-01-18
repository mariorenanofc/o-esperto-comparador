import { QueryClient } from '@tanstack/react-query';

// Configurações otimizadas de cache por tipo de dados
export const CACHE_CONFIGS = {
  // Dados estáticos (raramente mudam)
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  },
  
  // Dados semi-estáticos (categorias, lojas)
  semiStatic: {
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  },
  
  // Dados dinâmicos (comparações do usuário)
  dynamic: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
  },
  
  // Dados voláteis (ofertas diárias)
  volatile: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  },
  
  // Dados de tempo real (notificações, presença)
  realtime: {
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 1,
  },
} as const;

// Query keys organizados hierarquicamente
export const QUERY_KEYS = {
  // Produtos
  products: {
    all: ['products'] as const,
    list: () => [...QUERY_KEYS.products.all, 'list'] as const,
    search: (term: string) => [...QUERY_KEYS.products.all, 'search', term] as const,
    byCategory: (category: string) => [...QUERY_KEYS.products.all, 'category', category] as const,
    detail: (id: string) => [...QUERY_KEYS.products.all, 'detail', id] as const,
  },
  
  // Lojas
  stores: {
    all: ['stores'] as const,
    list: () => [...QUERY_KEYS.stores.all, 'list'] as const,
    byLocation: (city: string, state: string) => [...QUERY_KEYS.stores.all, 'location', city, state] as const,
    ranking: (city: string) => [...QUERY_KEYS.stores.all, 'ranking', city] as const,
  },
  
  // Ofertas
  offers: {
    all: ['offers'] as const,
    daily: () => [...QUERY_KEYS.offers.all, 'daily'] as const,
    byLocation: (city: string, state: string) => [...QUERY_KEYS.offers.all, 'location', city, state] as const,
    search: (query: string, city?: string, state?: string) => 
      [...QUERY_KEYS.offers.all, 'search', query, city || '', state || ''] as const,
    stats: () => [...QUERY_KEYS.offers.all, 'stats'] as const,
  },
  
  // Comparações
  comparisons: {
    all: ['comparisons'] as const,
    user: (userId: string) => [...QUERY_KEYS.comparisons.all, 'user', userId] as const,
    detail: (id: string) => [...QUERY_KEYS.comparisons.all, 'detail', id] as const,
    exports: (userId: string) => [...QUERY_KEYS.comparisons.all, 'exports', userId] as const,
  },
  
  // Usuário
  user: {
    profile: (userId: string) => ['user', 'profile', userId] as const,
    stats: (userId: string) => ['user', 'stats', userId] as const,
    achievements: (userId: string) => ['user', 'achievements', userId] as const,
    alerts: (userId: string) => ['user', 'alerts', userId] as const,
    lists: (userId: string) => ['user', 'lists', userId] as const,
  },
  
  // Gamificação
  gamification: {
    leaderboard: (period: string) => ['gamification', 'leaderboard', period] as const,
    userRank: (userId: string) => ['gamification', 'rank', userId] as const,
  },
  
  // Admin
  admin: {
    users: () => ['admin', 'users'] as const,
    feedback: () => ['admin', 'feedback'] as const,
    analytics: () => ['admin', 'analytics'] as const,
    performance: () => ['admin', 'performance'] as const,
  },
  
  // Notificações
  notifications: {
    all: ['notifications'] as const,
    unread: (userId: string) => [...QUERY_KEYS.notifications.all, 'unread', userId] as const,
    settings: (userId: string) => [...QUERY_KEYS.notifications.all, 'settings', userId] as const,
  },
  
  // Categorias
  categories: {
    all: ['categories'] as const,
  },
} as const;

// Configuração otimizada do QueryClient
export const createOptimizedQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: CACHE_CONFIGS.dynamic.staleTime,
        gcTime: CACHE_CONFIGS.dynamic.gcTime,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error: any) => {
          // Não retentar em erros 4xx
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
};

// Função para determinar config baseado no tipo de query
export const getQueryConfig = (queryKey: readonly unknown[]) => {
  const key = queryKey[0] as string;
  
  switch (key) {
    case 'categories':
    case 'stores':
      return CACHE_CONFIGS.semiStatic;
    
    case 'products':
      return CACHE_CONFIGS.semiStatic;
    
    case 'offers':
      return CACHE_CONFIGS.volatile;
    
    case 'notifications':
      return CACHE_CONFIGS.realtime;
    
    case 'comparisons':
    case 'user':
      return CACHE_CONFIGS.dynamic;
    
    case 'admin':
      return CACHE_CONFIGS.dynamic;
    
    case 'gamification':
      return CACHE_CONFIGS.dynamic;
    
    default:
      return CACHE_CONFIGS.dynamic;
  }
};
