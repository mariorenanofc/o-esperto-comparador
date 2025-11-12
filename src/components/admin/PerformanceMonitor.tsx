import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCacheStats } from '@/hooks/useOptimizedQueries';
import { getCacheService } from '@/services/reactiveCache';
import { logger } from '@/lib/logger';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface PerformanceStats {
  total_products: number;
  total_offers: number;
  recent_offers_24h: number;
  avg_response_time_ms: number;
  cache_optimization_active: boolean;
  indexes_created: boolean;
  last_updated: string;
}

export const PerformanceMonitor = () => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { handleAsync } = useErrorHandler({ component: 'PerformanceMonitor' });
  
  const cacheStats = useCacheStats();

  const fetchPerformanceStats = async () => {
    setLoading(true);
    const result = await handleAsync(
      async () => {
        logger.info('Fetching performance stats');
        const { data, error } = await supabase
          .from('products')
          .select('id')
          .limit(1);
        
        if (error) throw error;

        const mockStats: PerformanceStats = {
          total_products: 0,
          total_offers: 0,
          recent_offers_24h: 0,
          avg_response_time_ms: 0,
          cache_optimization_active: true,
          indexes_created: true,
          last_updated: new Date().toISOString()
        };

        logger.info('Performance stats updated', { stats: mockStats });
        return mockStats;
      },
      { action: 'fetch_performance_stats' },
      { showToast: false, severity: 'low' }
    );
    
    if (result) {
      setStats(result);
      setLastRefresh(new Date());
    }
    setLoading(false);
  };

  const handleCacheCleanup = async () => {
    await handleAsync(
      async () => {
        logger.info('Starting cache cleanup');
        const cacheService = getCacheService();
        await cacheService.cleanupStaleCache();
        logger.info('Cache cleanup completed');
      },
      { action: 'cache_cleanup' },
      { showToast: true, severity: 'low' }
    );
  };

  useEffect(() => {
    fetchPerformanceStats();
    
    // Auto-refresh a cada 2 minutos
    const interval = setInterval(fetchPerformanceStats, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getHealthStatus = (): { status: string; color: 'default' | 'secondary' | 'outline' | 'destructive' } => {
    if (!stats) return { status: 'unknown', color: 'secondary' };
    
    const avgResponseTime = stats.avg_response_time_ms;
    const cacheHitRate = parseFloat(cacheStats.cacheHitRate);
    
    if (avgResponseTime < 200 && cacheHitRate > 80) {
      return { status: 'excellent', color: 'default' };
    } else if (avgResponseTime < 500 && cacheHitRate > 60) {
      return { status: 'good', color: 'secondary' };
    } else if (avgResponseTime < 1000 && cacheHitRate > 40) {
      return { status: 'warning', color: 'outline' };
    } else {
      return { status: 'poor', color: 'destructive' };
    }
  };

  const health = getHealthStatus();

  if (loading && !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitor de Performance
          </CardTitle>
          <CardDescription>
            Carregando métricas de performance...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <CardTitle>Monitor de Performance</CardTitle>
            <Badge variant={health.color}>
              {health.status === 'excellent' && '🟢 Excelente'}
              {health.status === 'good' && '🟡 Bom'}
              {health.status === 'warning' && '🟠 Atenção'}
              {health.status === 'poor' && '🔴 Crítico'}
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchPerformanceStats}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
        <CardDescription>
          Última atualização: {lastRefresh.toLocaleTimeString('pt-BR')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estatísticas do Banco */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats?.total_products || 0}</div>
            <div className="text-sm text-muted-foreground">Produtos</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats?.total_offers || 0}</div>
            <div className="text-sm text-muted-foreground">Ofertas Total</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats?.recent_offers_24h || 0}</div>
            <div className="text-sm text-muted-foreground">Ofertas 24h</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats?.avg_response_time_ms || 0}ms</div>
            <div className="text-sm text-muted-foreground">Tempo Resposta</div>
          </div>
        </div>

        {/* Estatísticas do Cache */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            📦 Cache Performance
            <Badge variant="outline">{cacheStats.cacheHitRate}% Hit Rate</Badge>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Queries</div>
              <div className="font-medium">{cacheStats.totalQueries}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Stale Queries</div>
              <div className="font-medium">{cacheStats.staleQueries}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Fetching</div>
              <div className="font-medium">{cacheStats.fetchingQueries}</div>
            </div>
            <div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCacheCleanup}
              >
                Limpar Cache
              </Button>
            </div>
          </div>
        </div>

        {/* Status das Otimizações */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">🚀 Otimizações Ativas</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              {stats?.cache_optimization_active ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span>Cache Reativo</span>
            </div>
            <div className="flex items-center gap-2">
              {stats?.indexes_created ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span>Índices DB</span>
            </div>
          </div>
        </div>

        {/* Recomendações */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">💡 Recomendações</h4>
          <div className="space-y-2 text-sm">
            {parseFloat(cacheStats.cacheHitRate) < 70 && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                ⚠️ Cache hit rate baixo. Considere ajustar tempos de cache.
              </div>
            )}
            {(stats?.avg_response_time_ms || 0) > 500 && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800">
                🐌 Tempo de resposta alto. Verifique queries e índices.
              </div>
            )}
            {cacheStats.staleQueries > cacheStats.totalQueries * 0.3 && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-blue-800">
                🔄 Muitas queries stale. Execute limpeza de cache.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};