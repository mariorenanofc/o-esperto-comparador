import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface RealTimeMetrics {
  activeUsers: number;
  totalSessions: number;
  pageViews: number;
  errorRate: number;
  averageLoadTime: number;
  offersCreated: number;
  comparisonsCreated: number;
  cacheHitRate: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  lastUpdated: Date;
}

interface MetricsContextType {
  metrics: RealTimeMetrics | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const useRealTimeMetrics = () => {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error('useRealTimeMetrics must be used within a RealTimeMetricsProvider');
  }
  return context;
};

export const RealTimeMetricsProvider: React.FC<{
  children: React.ReactNode;
  updateInterval?: number;
}> = ({ children, updateInterval = 30000 }) => {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['realtime-metrics'],
    queryFn: async (): Promise<RealTimeMetrics> => {
      const start = performance.now();
      
      try {
        // Get basic counts from database
        const [profilesResult, offersResult, comparisonsResult] = await Promise.allSettled([
          supabase.from('profiles').select('count').eq('is_online', true),
          supabase.from('daily_offers').select('count').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('comparisons').select('count').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        ]);

        // Calculate mock metrics (in real app, these would come from analytics)
        const activeUsers = profilesResult.status === 'fulfilled' ? 
          Math.floor(Math.random() * 50) + 10 : 0;
        
        const offersCreated = offersResult.status === 'fulfilled' ? 
          Math.floor(Math.random() * 20) + 5 : 0;
        
        const comparisonsCreated = comparisonsResult.status === 'fulfilled' ? 
          Math.floor(Math.random() * 15) + 3 : 0;

        const metrics: RealTimeMetrics = {
          activeUsers,
          totalSessions: activeUsers * 2,
          pageViews: activeUsers * 8,
          errorRate: Math.random() * 2, // 0-2%
          averageLoadTime: 800 + Math.random() * 400, // 800-1200ms
          offersCreated,
          comparisonsCreated,
          cacheHitRate: 85 + Math.random() * 10, // 85-95%
          systemHealth: Math.random() > 0.9 ? 'warning' : 'healthy',
          lastUpdated: new Date(),
        };

        const duration = performance.now() - start;
        logger.performance('Real-time metrics fetch', duration);

        return metrics;
      } catch (error) {
        logger.error('Failed to fetch real-time metrics', error as Error);
        throw error;
      }
    },
    refetchInterval: updateInterval,
    staleTime: updateInterval / 2,
  });

  // Update metrics when data changes
  useEffect(() => {
    if (data) {
      setMetrics(data);
    }
  }, [data]);

  // Real-time subscription for critical events
  useEffect(() => {
    const channels = [
      // Listen for new daily offers
      supabase
        .channel('daily_offers_changes')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'daily_offers' },
          (payload) => {
            logger.info('New daily offer created', { payload });
            setMetrics(prev => prev ? {
              ...prev, 
              offersCreated: prev.offersCreated + 1,
              lastUpdated: new Date()
            } : null);
          }
        )
        .subscribe(),

      // Listen for new comparisons
      supabase
        .channel('comparisons_changes')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'comparisons' },
          (payload) => {
            logger.info('New comparison created', { payload });
            setMetrics(prev => prev ? {
              ...prev,
              comparisonsCreated: prev.comparisonsCreated + 1,
              lastUpdated: new Date()
            } : null);
          }
        )
        .subscribe(),

      // Listen for user profile changes (online status)
      supabase
        .channel('profiles_changes')
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles' },
          (payload) => {
            const { new: newProfile, old: oldProfile } = payload;
            
            // Only update if online status changed
            if (newProfile.is_online !== oldProfile.is_online) {
              logger.info('User online status changed', { 
                userId: newProfile.id, 
                isOnline: newProfile.is_online 
              });
              
              setMetrics(prev => prev ? {
                ...prev,
                activeUsers: newProfile.is_online ? 
                  prev.activeUsers + 1 : 
                  Math.max(0, prev.activeUsers - 1),
                lastUpdated: new Date()
              } : null);
            }
          }
        )
        .subscribe(),
    ];

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  const refresh = () => {
    logger.info('Manually refreshing real-time metrics');
    refetch();
  };

  return (
    <MetricsContext.Provider
      value={{
        metrics,
        isLoading,
        error: error as Error | null,
        refresh,
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
};

// Hook for specific metric subscriptions
export const useMetricAlert = (
  metricName: keyof RealTimeMetrics,
  threshold: number,
  comparison: 'greater' | 'less' = 'greater'
) => {
  const { metrics } = useRealTimeMetrics();
  const [isTriggered, setIsTriggered] = useState(false);

  useEffect(() => {
    if (!metrics || typeof metrics[metricName] !== 'number') return;

    const value = metrics[metricName] as number;
    const triggered = comparison === 'greater' ? 
      value > threshold : 
      value < threshold;

    if (triggered && !isTriggered) {
      logger.warn(`Metric alert triggered: ${metricName}`, {
        value,
        threshold,
        comparison,
      });
      setIsTriggered(true);
    } else if (!triggered && isTriggered) {
      setIsTriggered(false);
    }
  }, [metrics, metricName, threshold, comparison, isTriggered]);

  return isTriggered;
};

// Component for displaying real-time metric
export const RealTimeMetric: React.FC<{
  metricName: keyof RealTimeMetrics;
  label: string;
  format?: (value: any) => string;
  className?: string;
}> = ({ metricName, label, format, className = '' }) => {
  const { metrics, isLoading } = useRealTimeMetrics();

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-muted rounded mb-1"></div>
        <div className="h-6 bg-muted rounded"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">--</p>
      </div>
    );
  }

  const value = metrics[metricName];
  const displayValue = format ? format(value) : String(value);

  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{displayValue}</p>
    </div>
  );
};