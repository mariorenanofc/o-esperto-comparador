import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Activity, Clock } from 'lucide-react';
import { useCacheStats } from '@/hooks/useOptimizedQueries';
import { getCacheService } from '@/services/reactiveCache';
import { toast } from 'sonner';

interface CacheMonitorProps {
  isDevelopment?: boolean;
}

export const CacheMonitor: React.FC<CacheMonitorProps> = ({ 
  isDevelopment 
}) => {
  const stats = useCacheStats();

  // Detect production environments more robustly
  const isProductionHost = typeof window !== 'undefined' && (
    window.location.hostname.includes('lovable.app') ||
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('netlify.app') ||
    (!window.location.hostname.includes('localhost') && 
     !window.location.hostname.includes('127.0.0.1'))
  );

  // Only show in development mode or when explicitly enabled
  const shouldShow = !isProductionHost && 
    (isDevelopment ?? import.meta.env.DEV) && 
    import.meta.env.VITE_SHOW_CACHE_MONITOR !== 'false';
  
  if (!shouldShow) {
    return null;
  }

  const handleCleanup = async () => {
    try {
      const cacheService = getCacheService();
      await cacheService.cleanupStaleCache();
      toast.success('Cache limpo com sucesso');
    } catch (error) {
      toast.error('Erro ao limpar cache');
      console.error('Cache cleanup error:', error);
    }
  };

  const handleReset = async () => {
    try {
      const cacheService = getCacheService();
      await cacheService.resetCache();
      toast.success('Cache resetado com sucesso');
    } catch (error) {
      toast.error('Erro ao resetar cache');
      console.error('Cache reset error:', error);
    }
  };

  const getCacheHealth = () => {
    const hitRate = parseFloat(stats.cacheHitRate);
    if (hitRate >= 80) return { color: 'bg-green-500', status: 'Excelente' };
    if (hitRate >= 60) return { color: 'bg-yellow-500', status: 'Bom' };
    return { color: 'bg-red-500', status: 'Precisa melhorar' };
  };

  const health = getCacheHealth();

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 opacity-90 hover:opacity-100 transition-opacity">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="h-4 w-4" />
          Cache Monitor
          <div className={`w-2 h-2 rounded-full ${health.color}`} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            <span>Queries: {stats.totalQueries}</span>
          </div>
          <div className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            <span>Stale: {stats.staleQueries}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Fetching: {stats.fetchingQueries}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Hit Rate: {stats.cacheHitRate}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {health.status}
          </Badge>
          <div className="flex gap-1 ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCleanup}
              className="h-6 px-2 text-xs"
            >
              Limpar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="h-6 px-2 text-xs"
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Cache evita {stats.cacheHitRate}% das requisições desnecessárias
        </div>
      </CardContent>
    </Card>
  );
};