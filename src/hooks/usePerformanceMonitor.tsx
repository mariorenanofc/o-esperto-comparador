import { useEffect, useRef, useState } from 'react';
import { logger, measurePerformance } from '@/lib/logger';
import { toast } from 'sonner';

interface PerformanceMetrics {
  renderTime: number;
  reRenderCount: number;
  memoryUsage?: number;
  isSlowRender: boolean;
  componentName?: string;
}

interface PerformanceAlerts {
  slowRender: boolean;
  memoryLeak: boolean;
  excessiveReRenders: boolean;
}

// Hook para monitorar performance de componentes
export const usePerformanceMonitor = (componentName: string, options?: {
  slowRenderThreshold?: number;
  maxReRenders?: number;
  enableMemoryTracking?: boolean;
}) => {
  const renderStartTime = useRef<number>();
  const renderCount = useRef(0);
  const initialMemory = useRef<number>();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlerts>({
    slowRender: false,
    memoryLeak: false,
    excessiveReRenders: false,
  });

  const slowRenderThreshold = options?.slowRenderThreshold || 16; // 16ms = 60fps
  const maxReRenders = options?.maxReRenders || 10;
  const enableMemoryTracking = options?.enableMemoryTracking || false;

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;

    // Track initial memory if supported
    if (enableMemoryTracking && 'memory' in performance && renderCount.current === 1) {
      initialMemory.current = (performance as any).memory?.usedJSHeapSize;
    }

    return () => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        const isSlowRender = renderTime > slowRenderThreshold;
        
        let currentMemory: number | undefined;
        if (enableMemoryTracking && 'memory' in performance) {
          currentMemory = (performance as any).memory?.usedJSHeapSize;
        }

        const newMetrics: PerformanceMetrics = {
          renderTime,
          reRenderCount: renderCount.current,
          memoryUsage: currentMemory,
          isSlowRender,
          componentName,
        };

        setMetrics(newMetrics);

        // Check for performance issues
        const newAlerts: PerformanceAlerts = {
          slowRender: isSlowRender,
          memoryLeak: enableMemoryTracking && currentMemory && initialMemory.current ? 
            currentMemory > initialMemory.current * 1.5 : false,
          excessiveReRenders: renderCount.current > maxReRenders,
        };

        setAlerts(newAlerts);

        // Log performance issues
        if (isSlowRender) {
          logger.warn(`Slow render detected in ${componentName}`, {
            renderTime,
            threshold: slowRenderThreshold,
            reRenderCount: renderCount.current,
          });
        }

        if (newAlerts.excessiveReRenders) {
          logger.warn(`Excessive re-renders in ${componentName}`, {
            reRenderCount: renderCount.current,
            maxReRenders,
          });
        }

        if (newAlerts.memoryLeak) {
          logger.error(`Potential memory leak in ${componentName}`, new Error('Memory leak detected'), {
            initialMemory: initialMemory.current,
            currentMemory,
            componentMemoryIncrease: currentMemory && initialMemory.current ? 
              currentMemory - initialMemory.current : 0,
          });
        }

        // Show user alerts for critical issues (only in development)
        if (process.env.NODE_ENV === 'development') {
          if (newAlerts.slowRender && renderTime > slowRenderThreshold * 2) {
            toast.warning(`${componentName}: Render lento (${renderTime.toFixed(1)}ms)`);
          }
          
          if (newAlerts.excessiveReRenders) {
            toast.warning(`${componentName}: Muitos re-renders (${renderCount.current})`);
          }
        }
      }
    };
  });

  return {
    metrics,
    alerts,
    renderCount: renderCount.current,
  };
};

// Hook para monitorar vitals da página
export const usePageVitals = () => {
  const [vitals, setVitals] = useState<{
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
  }>({});

  useEffect(() => {
    const trackVitals = async () => {
      try {
        const { onLCP, onCLS, onFCP, onINP } = await import('web-vitals');
        
        onLCP((metric) => {
          setVitals(prev => ({ ...prev, lcp: metric.value }));
          logger.performance('LCP', metric.value, { metric: metric.name });
        });
        
        // Use onINP instead of deprecated onFID
        onINP((metric) => {
          setVitals(prev => ({ ...prev, fid: metric.value }));
          logger.performance('INP', metric.value, { metric: metric.name });
        });
        
        onCLS((metric) => {
          setVitals(prev => ({ ...prev, cls: metric.value }));
          logger.performance('CLS', metric.value, { metric: metric.name });
        });
        
        onFCP((metric) => {
          setVitals(prev => ({ ...prev, fcp: metric.value }));
          logger.performance('FCP', metric.value, { metric: metric.name });
        });
      } catch (error) {
        logger.error('Failed to load web-vitals', error as Error);
      }
    };

    trackVitals();
  }, []);

  return vitals;
};

// Hook para monitorar API calls
export const useApiMonitor = () => {
  const [apiMetrics, setApiMetrics] = useState<{
    totalCalls: number;
    errorRate: number;
    averageResponseTime: number;
    slowCalls: number;
  }>({
    totalCalls: 0,
    errorRate: 0,
    averageResponseTime: 0,
    slowCalls: 0,
  });

  const trackApiCall = (
    method: string,
    url: string,
    duration: number,
    success: boolean
  ) => {
    setApiMetrics(prev => {
      const newTotalCalls = prev.totalCalls + 1;
      const newErrorRate = success ? 
        (prev.errorRate * prev.totalCalls) / newTotalCalls :
        (prev.errorRate * prev.totalCalls + 1) / newTotalCalls;
      
      const newAverageResponseTime = 
        (prev.averageResponseTime * prev.totalCalls + duration) / newTotalCalls;
      
      const newSlowCalls = duration > 2000 ? prev.slowCalls + 1 : prev.slowCalls;

      return {
        totalCalls: newTotalCalls,
        errorRate: newErrorRate,
        averageResponseTime: newAverageResponseTime,
        slowCalls: newSlowCalls,
      };
    });

    logger.apiCall(method, url, duration, success ? 200 : 500);
  };

  return {
    apiMetrics,
    trackApiCall,
  };
};

// HOC para monitoramento automático de performance
export const withPerformanceMonitor = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  const MonitoredComponent = (props: P) => {
    const name = componentName || WrappedComponent.name || 'Unknown';
    const { metrics, alerts } = usePerformanceMonitor(name);

    // In development, log performance metrics
    useEffect(() => {
      if (process.env.NODE_ENV === 'development' && metrics) {
        console.log(`📊 Performance metrics for ${name}:`, metrics);
      }
    }, [metrics, name]);

    return <WrappedComponent {...props} />;
  };

  MonitoredComponent.displayName = `withPerformanceMonitor(${componentName || WrappedComponent.name})`;
  
  return MonitoredComponent;
};