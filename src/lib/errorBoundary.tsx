import React, { Component, ErrorInfo, ReactNode } from 'react';
import { analytics } from '@/lib/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorId: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || 'unknown';
    
    // Log structured error
    console.error(`🚨 [${errorId}] Error Boundary caught an error:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ErrorBoundary',
      timestamp: new Date().toISOString(),
    });

    // Track error with analytics
    analytics.trackError(error, {
      errorId,
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      page: window.location.pathname,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Show user-friendly notification
    toast.error('Algo deu errado. Nossa equipe foi notificada.');
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-lg">Ops! Algo deu errado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Encontramos um erro inesperado. Nossa equipe foi notificada automaticamente.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs bg-muted p-2 rounded">
                  <summary className="cursor-pointer font-medium mb-2">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar novamente
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={this.handleGoHome}
                    className="flex-1"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Início
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={this.handleReload}
                    className="flex-1"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Recarregar
                  </Button>
                </div>
              </div>

              {this.state.errorId && (
                <p className="text-xs text-muted-foreground text-center">
                  ID do erro: {this.state.errorId}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para capturar erros assíncronos
export const useErrorHandler = () => {
  return React.useCallback((error: Error, context?: Record<string, any>) => {
    console.error('🚨 Async Error:', error, context);
    
    analytics.trackError(error, {
      ...context,
      async: true,
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
    });

    toast.error('Erro inesperado. Tente novamente.');
  }, []);
};