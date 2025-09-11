import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/lib/errorBoundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

interface LoadingBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  name?: string;
  showOfflineIndicator?: boolean;
}

const DefaultLoadingFallback = ({ name }: { name?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center space-y-4">
      <LoadingSpinner className="mx-auto" />
      <p className="text-sm text-muted-foreground">
        {name ? `Carregando ${name}...` : 'Carregando...'}
      </p>
    </div>
  </div>
);

const DefaultErrorFallback = ({ 
  name, 
  onRetry 
}: { 
  name?: string;
  onRetry?: () => void;
}) => (
  <Card className="m-4">
    <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <div className="text-center space-y-2">
        <h3 className="font-semibold">Erro ao carregar</h3>
        <p className="text-sm text-muted-foreground">
          {name ? `Não foi possível carregar ${name}` : 'Algo deu errado'}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} size="sm">
          Tentar novamente
        </Button>
      )}
    </CardContent>
  </Card>
);

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      logger.info('Connection restored');
    };
    const handleOffline = () => {
      setIsOnline(false);
      logger.warn('Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <Card className="bg-destructive text-destructive-foreground">
        <CardContent className="flex items-center gap-2 px-4 py-2">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">Sem conexão</span>
        </CardContent>
      </Card>
    </div>
  );
};

export const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({
  children,
  fallback,
  errorFallback,
  name,
  showOfflineIndicator = true,
}) => {
  const [retryKey, setRetryKey] = React.useState(0);

  const handleRetry = React.useCallback(() => {
    logger.info(`Retrying ${name || 'component'}`, { retryCount: retryKey + 1 });
    setRetryKey(prev => prev + 1);
  }, [name, retryKey]);

  const handleError = React.useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    logger.error(`LoadingBoundary caught error in ${name || 'unknown component'}`, error, {
      componentStack: errorInfo.componentStack,
      name,
    });
  }, [name]);

  return (
    <>
      {showOfflineIndicator && <OfflineIndicator />}
      
      <ErrorBoundary
        key={retryKey}
        onError={handleError}
        fallback={
          errorFallback || (
            <DefaultErrorFallback 
              name={name} 
              onRetry={handleRetry}
            />
          )
        }
      >
        <Suspense
          fallback={
            fallback || <DefaultLoadingFallback name={name} />
          }
        >
          {children}
        </Suspense>
      </ErrorBoundary>
    </>
  );
};

// HOC version for easier usage
export const withLoadingBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: Omit<LoadingBoundaryProps, 'children'>
) => {
  const BoundaryWrappedComponent = (props: P) => (
    <LoadingBoundary {...options}>
      <WrappedComponent {...props} />
    </LoadingBoundary>
  );

  BoundaryWrappedComponent.displayName = 
    `withLoadingBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return BoundaryWrappedComponent;
};

// Specialized loading boundaries for common use cases
export const PageLoadingBoundary: React.FC<{
  children: React.ReactNode;
  pageName: string;
}> = ({ children, pageName }) => (
  <LoadingBoundary
    name={`página ${pageName}`}
    fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold">Carregando {pageName}</h2>
            <p className="text-sm text-muted-foreground">
              Aguarde enquanto preparamos tudo para você...
            </p>
          </div>
        </div>
      </div>
    }
  >
    {children}
  </LoadingBoundary>
);

export const ComponentLoadingBoundary: React.FC<{
  children: React.ReactNode;
  componentName: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ children, componentName, size = 'md' }) => {
  const padding = size === 'sm' ? 'p-4' : size === 'lg' ? 'p-8' : 'p-6';
  
  return (
    <LoadingBoundary
      name={componentName}
      fallback={
        <div className={`flex items-center justify-center ${padding}`}>
          <div className="text-center space-y-2">
            <LoadingSpinner size={size} />
            <p className="text-xs text-muted-foreground">
              Carregando {componentName}...
            </p>
          </div>
        </div>
      }
    >
      {children}
    </LoadingBoundary>
  );
};