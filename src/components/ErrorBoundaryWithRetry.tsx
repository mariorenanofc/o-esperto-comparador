import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { errorHandler } from '@/lib/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: any[];
  context?: {
    component?: string;
    feature?: string;
  };
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
  lastErrorTime: number | null;
}

export class ErrorBoundaryWithRetry extends Component<Props, State> {
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RESET_INTERVAL = 30000; // 30 seconds

  public state: State = {
    hasError: false,
    error: null,
    errorCount: 0,
    lastErrorTime: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const now = Date.now();
    const timeSinceLastError = this.state.lastErrorTime 
      ? now - this.state.lastErrorTime 
      : Infinity;

    // Reset count if enough time has passed
    const errorCount = timeSinceLastError > this.RESET_INTERVAL 
      ? 1 
      : this.state.errorCount + 1;

    this.setState({
      errorCount,
      lastErrorTime: now,
    });

    // Log error with structured handler
    errorHandler.handle(error, {
      component: this.props.context?.component || 'ErrorBoundary',
      action: this.props.context?.feature || 'render',
      metadata: {
        errorCount,
        componentStack: errorInfo.componentStack,
        resetKeys: this.props.resetKeys,
      }
    }, {
      severity: errorCount > 2 ? 'critical' : 'high',
      showToast: false, // Don't show toast - we'll show custom UI
    });

    this.props.onError?.(error, errorInfo);
  }

  public componentDidUpdate(prevProps: Props) {
    // Reset error state if resetKeys changed
    if (this.state.hasError && this.props.resetKeys) {
      const hasKeyChanged = this.props.resetKeys.some((key, index) => {
        return prevProps.resetKeys?.[index] !== key;
      });

      if (hasKeyChanged) {
        this.handleReset();
      }
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private canRetry = (): boolean => {
    return this.state.errorCount < this.MAX_RETRY_ATTEMPTS;
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.canRetry();
      const isCritical = this.state.errorCount >= this.MAX_RETRY_ATTEMPTS;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                {isCritical ? (
                  <Bug className="h-6 w-6 text-destructive" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                )}
              </div>
              <CardTitle className="text-lg">
                {isCritical ? 'Erro Crítico' : 'Ops! Algo deu errado'}
              </CardTitle>
              <CardDescription>
                {isCritical 
                  ? 'Múltiplas tentativas falharam. Nossa equipe foi notificada.'
                  : 'Encontramos um problema inesperado.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {this.state.errorCount > 1 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Tentativa {this.state.errorCount}/{this.MAX_RETRY_ATTEMPTS}</AlertTitle>
                  <AlertDescription>
                    {canRetry 
                      ? 'Você pode tentar novamente ou recarregar a página.'
                      : 'Recomendamos recarregar a página completamente.'}
                  </AlertDescription>
                </Alert>
              )}

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs bg-muted p-3 rounded">
                  <summary className="cursor-pointer font-medium mb-2">
                    Detalhes técnicos (desenvolvimento)
                  </summary>
                  <pre className="whitespace-pre-wrap overflow-auto max-h-32 text-xs">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col gap-2">
                {canRetry && (
                  <Button 
                    onClick={this.handleReset} 
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tentar novamente
                  </Button>
                )}
                
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

              {this.props.context && (
                <p className="text-xs text-muted-foreground text-center">
                  Componente: {this.props.context.component}
                  {this.props.context.feature && ` • ${this.props.context.feature}`}
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
