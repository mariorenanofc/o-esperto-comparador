import { useEffect, useRef } from 'react';
import { logger } from '@/lib/logger';

// Test utilities and helpers for development and testing

export const useTestingHelpers = (options?: {
  enableDataTestIds?: boolean;
  enableAccessibilityChecks?: boolean;
  enablePerformanceLogging?: boolean;
}) => {
  const {
    enableDataTestIds = process.env.NODE_ENV !== 'production',
    enableAccessibilityChecks = process.env.NODE_ENV === 'development',
    enablePerformanceLogging = process.env.NODE_ENV === 'development',
  } = options || {};

  // Generate unique test IDs
  const generateTestId = (prefix: string) => {
    return enableDataTestIds ? `${prefix}-${Date.now()}` : undefined;
  };

  // Check for common accessibility issues
  const checkAccessibility = (element: HTMLElement) => {
    if (!enableAccessibilityChecks) return;

    const issues: string[] = [];

    // Check for images without alt text
    const images = element.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      issues.push(`${images.length} image(s) missing alt attribute`);
    }

    // Check for buttons without accessible names
    const buttons = element.querySelectorAll('button:not([aria-label]):not([title])');
    const buttonsWithoutText = Array.from(buttons).filter(btn => !btn.textContent?.trim());
    if (buttonsWithoutText.length > 0) {
      issues.push(`${buttonsWithoutText.length} button(s) without accessible names`);
    }

    // Check for form inputs without labels
    const inputs = element.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    const inputsWithoutLabels = Array.from(inputs).filter(input => {
      const id = input.getAttribute('id');
      return !id || !element.querySelector(`label[for="${id}"]`);
    });
    if (inputsWithoutLabels.length > 0) {
      issues.push(`${inputsWithoutLabels.length} input(s) without proper labels`);
    }

    // Check for poor color contrast (basic check)
    const elementsWithText = element.querySelectorAll('*');
    let lowContrastElements = 0;
    Array.from(elementsWithText).forEach(el => {
      if (el.textContent?.trim()) {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Simple check - if both are very light or very dark
        if (color === backgroundColor || 
            (color.includes('rgb(255') && backgroundColor.includes('rgb(255')) ||
            (color.includes('rgb(0') && backgroundColor.includes('rgb(0'))) {
          lowContrastElements++;
        }
      }
    });
    if (lowContrastElements > 0) {
      issues.push(`${lowContrastElements} element(s) may have low color contrast`);
    }

    if (issues.length > 0) {
      logger.warn('Accessibility issues detected', {
        issues,
        element: element.tagName,
        className: element.className,
      });
    }
  };

  // Performance measurement wrapper
  const measureAsync = async <T extends any>(
    name: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> => {
    if (!enablePerformanceLogging) {
      return await fn();
    }

    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      logger.performance(name, duration, context);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(`Performance measurement failed: ${name}`, error as Error, {
        duration,
        ...context,
      });
      throw error;
    }
  };

  // Simulate slow network for testing
  const simulateSlowNetwork = (delay: number = 2000) => {
    if (process.env.NODE_ENV !== 'development') return;
    
    return new Promise(resolve => {
      logger.debug(`Simulating slow network: ${delay}ms delay`);
      setTimeout(resolve, delay);
    });
  };

  // Mock API responses for testing
  const createMockResponse = <T extends any>(data: T, delay?: number) => {
    return new Promise<T>((resolve) => {
      const resolveData = () => {
        logger.debug('Mock API response', { data });
        resolve(data);
      };
      
      if (delay) {
        setTimeout(resolveData, delay);
      } else {
        resolveData();
      }
    });
  };

  // Test data generators
  const generateTestData = {
    user: (overrides?: Partial<any>) => ({
      id: `test-user-${Math.random().toString(36).substr(2, 9)}`,
      email: `test@example.com`,
      name: `Test User`,
      plan: 'free',
      ...overrides,
    }),
    
    product: (overrides?: Partial<any>) => ({
      id: `test-product-${Math.random().toString(36).substr(2, 9)}`,
      name: `Test Product ${Math.random().toString(36).substr(2, 5)}`,
      category: 'test',
      unit: 'unidade',
      quantity: 1,
      ...overrides,
    }),
    
    comparison: (overrides?: Partial<any>) => ({
      id: `test-comparison-${Math.random().toString(36).substr(2, 9)}`,
      title: `Test Comparison ${Math.random().toString(36).substr(2, 5)}`,
      user_id: 'test-user',
      created_at: new Date().toISOString(),
      ...overrides,
    }),
  };

  // Ref para DOM testing
  const testRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (enableAccessibilityChecks && testRef.current) {
      // Check accessibility issues after render
      setTimeout(() => {
        if (testRef.current) {
          checkAccessibility(testRef.current);
        }
      }, 100);
    }
  });

  return {
    generateTestId,
    checkAccessibility,
    measureAsync,
    simulateSlowNetwork,
    createMockResponse,
    generateTestData,
    testRef,
    
    // Testing utilities
    isTestEnvironment: process.env.NODE_ENV === 'test',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  };
};

// Component wrapper for testing
export const TestWrapper: React.FC<{
  children: React.ReactNode;
  testId?: string;
  enableA11yChecks?: boolean;
}> = ({ 
  children, 
  testId, 
  enableA11yChecks = process.env.NODE_ENV === 'development' 
}) => {
  const { testRef, checkAccessibility } = useTestingHelpers({
    enableAccessibilityChecks: enableA11yChecks,
  });

  useEffect(() => {
    if (enableA11yChecks && testRef.current) {
      checkAccessibility(testRef.current);
    }
  }, [enableA11yChecks]);

  return (
    <div 
      ref={testRef}
      data-testid={testId}
      data-test-wrapper="true"
    >
      {children}
    </div>
  );
};

// Hook para simular estados de loading/error em desenvolvimento
export const useDevSimulation = () => {
  const simulateStates = {
    loading: (duration: number = 2000) => {
      if (process.env.NODE_ENV !== 'development') return Promise.resolve();
      
      logger.debug(`Simulating loading state for ${duration}ms`);
      return new Promise(resolve => setTimeout(resolve, duration));
    },
    
    error: (message: string = 'Simulated error') => {
      if (process.env.NODE_ENV !== 'development') return Promise.resolve();
      
      logger.debug(`Simulating error: ${message}`);
      return Promise.reject(new Error(message));
    },
    
    randomDelay: (min: number = 500, max: number = 2000) => {
      if (process.env.NODE_ENV !== 'development') return Promise.resolve();
      
      const delay = Math.random() * (max - min) + min;
      logger.debug(`Random delay: ${delay}ms`);
      return new Promise(resolve => setTimeout(resolve, delay));
    },
  };

  return {
    simulateStates,
    isDev: process.env.NODE_ENV === 'development',
  };
};