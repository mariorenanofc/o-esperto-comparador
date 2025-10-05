import { toast } from 'sonner';
import { logger } from './logger';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  severity?: ErrorSeverity;
  retry?: {
    enabled: boolean;
    maxAttempts?: number;
    onRetry?: () => Promise<void>;
  };
}

class ErrorHandler {
  private errorCount = new Map<string, number>();
  private readonly ERROR_THRESHOLD = 5;
  private readonly RESET_INTERVAL = 60000; // 1 minute

  constructor() {
    // Reset error counts periodically
    setInterval(() => {
      this.errorCount.clear();
    }, this.RESET_INTERVAL);
  }

  private getErrorKey(error: Error, context?: ErrorContext): string {
    return `${error.name}_${context?.component || 'unknown'}_${context?.action || 'unknown'}`;
  }

  private incrementErrorCount(key: string): number {
    const count = (this.errorCount.get(key) || 0) + 1;
    this.errorCount.set(key, count);
    return count;
  }

  private shouldShowToast(key: string): boolean {
    const count = this.errorCount.get(key) || 0;
    return count <= this.ERROR_THRESHOLD;
  }

  private getErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error_description) return error.error_description;
    return 'Erro inesperado. Tente novamente.';
  }

  private getUserFriendlyMessage(error: any, context?: ErrorContext): string {
    const message = this.getErrorMessage(error);

    // Network errors
    if (message.includes('fetch') || message.includes('network')) {
      return 'Erro de conexão. Verifique sua internet.';
    }

    // Authentication errors
    if (message.includes('auth') || message.includes('unauthorized')) {
      return 'Sessão expirada. Faça login novamente.';
    }

    // Permission errors
    if (message.includes('permission') || message.includes('forbidden')) {
      return 'Você não tem permissão para esta ação.';
    }

    // Validation errors
    if (message.includes('invalid') || message.includes('validation')) {
      return 'Dados inválidos. Verifique os campos.';
    }

    // Rate limit errors
    if (message.includes('rate limit') || message.includes('too many')) {
      return 'Muitas tentativas. Aguarde um momento.';
    }

    // Generic error with context
    if (context?.action) {
      return `Erro ao ${context.action}. Tente novamente.`;
    }

    return message;
  }

  public async handle(
    error: any,
    context?: ErrorContext,
    options: ErrorHandlerOptions = {}
  ): Promise<void> {
    const {
      showToast = true,
      logToConsole = true,
      severity = 'medium',
      retry
    } = options;

    const errorKey = this.getErrorKey(error, context);
    const errorCount = this.incrementErrorCount(errorKey);

    // Log to structured logger
    if (logToConsole) {
      logger.error('Application error', error, {
        ...context,
        severity,
        errorCount,
        timestamp: new Date().toISOString()
      });
    }

    // Show toast notification
    if (showToast && this.shouldShowToast(errorKey)) {
      const message = this.getUserFriendlyMessage(error, context);
      
      switch (severity) {
        case 'critical':
          toast.error(message, {
            duration: 10000,
            action: retry?.enabled ? {
              label: 'Tentar novamente',
              onClick: () => retry.onRetry?.()
            } : undefined
          });
          break;
        case 'high':
          toast.error(message, {
            duration: 7000,
            action: retry?.enabled ? {
              label: 'Tentar novamente',
              onClick: () => retry.onRetry?.()
            } : undefined
          });
          break;
        case 'medium':
          toast.error(message, { duration: 5000 });
          break;
        case 'low':
          toast(message, { duration: 3000 });
          break;
      }
    } else if (errorCount > this.ERROR_THRESHOLD) {
      // Too many errors - show critical alert
      toast.error('Muitos erros detectados. Recarregue a página.', {
        duration: 10000,
        action: {
          label: 'Recarregar',
          onClick: () => window.location.reload()
        }
      });
    }
  }

  public async handleAsync<T>(
    asyncFn: () => Promise<T>,
    context?: ErrorContext,
    options?: ErrorHandlerOptions
  ): Promise<T | null> {
    try {
      return await asyncFn();
    } catch (error) {
      await this.handle(error, context, options);
      return null;
    }
  }

  public async retry<T>(
    asyncFn: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000,
    context?: ErrorContext
  ): Promise<T | null> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await asyncFn();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxAttempts) {
          logger.warn(`Retry attempt ${attempt}/${maxAttempts}`, {
            ...context,
            attempt,
            error: this.getErrorMessage(error)
          });
          
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }

    // All retries failed
    await this.handle(lastError, context, {
      severity: 'high',
      showToast: true
    });

    return null;
  }

  public clearErrorCount(component?: string): void {
    if (component) {
      for (const key of this.errorCount.keys()) {
        if (key.includes(component)) {
          this.errorCount.delete(key);
        }
      }
    } else {
      this.errorCount.clear();
    }
  }
}

export const errorHandler = new ErrorHandler();
