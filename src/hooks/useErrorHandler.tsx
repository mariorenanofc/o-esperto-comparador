import { useCallback, useEffect } from 'react';
import { errorHandler, ErrorContext, ErrorHandlerOptions } from '@/lib/errorHandler';

export const useErrorHandler = (defaultContext?: ErrorContext) => {
  useEffect(() => {
    // Cleanup error counts for this component on unmount
    return () => {
      if (defaultContext?.component) {
        errorHandler.clearErrorCount(defaultContext.component);
      }
    };
  }, [defaultContext?.component]);

  const handleError = useCallback(
    async (error: any, context?: ErrorContext, options?: ErrorHandlerOptions) => {
      await errorHandler.handle(error, { ...defaultContext, ...context }, options);
    },
    [defaultContext]
  );

  const handleAsync = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      context?: ErrorContext,
      options?: ErrorHandlerOptions
    ): Promise<T | null> => {
      return errorHandler.handleAsync(asyncFn, { ...defaultContext, ...context }, options);
    },
    [defaultContext]
  );

  const retry = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      maxAttempts?: number,
      delay?: number,
      context?: ErrorContext
    ): Promise<T | null> => {
      return errorHandler.retry(asyncFn, maxAttempts, delay, { ...defaultContext, ...context });
    },
    [defaultContext]
  );

  return {
    handleError,
    handleAsync,
    retry
  };
};
