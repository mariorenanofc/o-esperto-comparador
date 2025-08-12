import React from 'react';
import { LoadingFallback } from './LoadingFallback';

interface OptimizedSuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  fullScreen?: boolean;
  message?: string;
}

export const OptimizedSuspense: React.FC<OptimizedSuspenseProps> = ({
  children,
  fallback,
  fullScreen = false,
  message = "Carregando..."
}) => {
  const defaultFallback = fallback || (
    <LoadingFallback 
      message={message} 
      fullScreen={fullScreen} 
    />
  );

  return (
    <React.Suspense fallback={defaultFallback}>
      {children}
    </React.Suspense>
  );
};

// HOC para wrapping componentes lazy com loading otimizado
export const withOptimizedLoading = <P extends object>(
  Component: React.ComponentType<P>,
  loadingMessage?: string
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <OptimizedSuspense message={loadingMessage}>
      <Component {...props} />
    </OptimizedSuspense>
  );
  
  WrappedComponent.displayName = `withOptimizedLoading(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};