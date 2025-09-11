import React, { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/LoadingFallback';
import { ErrorBoundary } from '@/lib/errorBoundary';

interface LazyLoaderProps {
  importFn: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  [key: string]: any;
}

// Generic lazy loader with error handling
export const LazyLoader: React.FC<LazyLoaderProps> = ({
  importFn,
  fallback,
  errorFallback,
  ...props
}) => {
  const LazyComponent = lazy(importFn);

  const defaultFallback = fallback || <LoadingFallback message="Carregando componente..." />;
  const defaultErrorFallback = errorFallback || (
    <div className="text-center p-8">
      <p className="text-destructive">Erro ao carregar componente</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-2 text-app-primary hover:underline"
      >
        Tentar novamente
      </button>
    </div>
  );

  return (
    <ErrorBoundary fallback={defaultErrorFallback}>
      <Suspense fallback={defaultFallback}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

// Lazy loaded route components
export const LazyComparison = lazy(() => import('@/pages/Comparison'));
export const LazyProductCatalog = lazy(() => import('@/pages/ProductCatalog'));
export const LazyContribute = lazy(() => import('@/pages/Contribute'));
export const LazyReports = lazy(() => import('@/pages/Reports'));
export const LazyEconomy = lazy(() => import('@/pages/Economy'));
export const LazyPlans = lazy(() => import('@/pages/Plans'));
export const LazyProfile = lazy(() => import('@/pages/Profile'));
export const LazyNotifications = lazy(() => import('@/pages/Notifications'));
export const LazyAdmin = lazy(() => import('@/pages/Admin'));

// Lazy loaded components
export const LazyPriceTable = lazy(() => import('@/components/PriceTable'));
export const LazyProductModal = lazy(() => import('@/components/ProductModal'));
export const LazyBestPricesByStore = lazy(() => import('@/components/BestPricesByStore'));
export const LazyDailyOffersSection = lazy(() => import('@/components/DailyOffersSection'));
export const LazyMonthlyReport = lazy(() => import('@/components/MonthlyReport'));

// Preload functions for critical components
export const preloadCriticalComponents = () => {
  // Preload components that are likely to be used soon
  const criticalImports = [
    () => import('@/pages/Comparison'),
    () => import('@/components/PriceTable'),
    () => import('@/components/ProductModal'),
  ];

  // Use requestIdleCallback if available, otherwise setTimeout
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      criticalImports.forEach(importFn => importFn());
    });
  } else {
    setTimeout(() => {
      criticalImports.forEach(importFn => importFn());
    }, 1000);
  }
};

// Component for route-based lazy loading with loading states
interface LazyRouteProps {
  component: React.ComponentType<any>;
  fallback?: React.ReactNode;
}

export const LazyRoute: React.FC<LazyRouteProps> = ({ 
  component: Component, 
  fallback 
}) => {
  const routeFallback = fallback || (
    <LoadingFallback message="Carregando página..." fullScreen />
  );

  return (
    <ErrorBoundary>
      <Suspense fallback={routeFallback}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
};

// Hook for dynamic imports with loading state
export const useDynamicImport = <T,>(importFn: () => Promise<T>) => {
  const [component, setComponent] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const importComponent = React.useCallback(async () => {
    if (component) return component;

    setLoading(true);
    setError(null);

    try {
      const imported = await importFn();
      setComponent(imported);
      return imported;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Import failed'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [importFn, component]);

  return { component, loading, error, importComponent };
};

// Bundle analyzer helper (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('Bundle Analysis');
    console.log('Use `npm run build` to analyze bundle size');
    console.log('Large chunks to consider lazy loading:');
    console.log('- Admin pages and components');
    console.log('- Reports and analytics');
    console.log('- Chart libraries');
    console.log('- PDF generation');
    console.groupEnd();
  }
};