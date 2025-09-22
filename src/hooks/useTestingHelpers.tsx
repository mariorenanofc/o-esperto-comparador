import { useRef, useCallback, useEffect } from 'react';

interface TestingOptions {
  enableTestIds?: boolean;
  enableAccessibilityChecks?: boolean;
  enablePerformanceLogging?: boolean;
}

export const useTestingHelpers = (options: TestingOptions = {}) => {
  const {
    enableTestIds = process.env.NODE_ENV === 'test',
    enableAccessibilityChecks = process.env.NODE_ENV === 'development',
    enablePerformanceLogging = process.env.NODE_ENV === 'development'
  } = options;

  const testRef = useRef<HTMLElement>(null);

  // Generate unique test IDs
  const generateTestId = useCallback((prefix: string) => {
    if (!enableTestIds) return undefined;
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, [enableTestIds]);

  // Basic accessibility checks
  const checkAccessibility = useCallback((element: HTMLElement) => {
    if (!enableAccessibilityChecks) return;

    const issues: string[] = [];

    // Check for missing alt text on images
    const images = element.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-hidden')) {
        issues.push(`Image ${index + 1} missing alt text`);
      }
    });

    // Check for buttons without accessible names
    const buttons = element.querySelectorAll('button');
    buttons.forEach((button, index) => {
      const hasText = button.textContent?.trim();
      const hasAriaLabel = button.getAttribute('aria-label');
      const hasAriaLabelledBy = button.getAttribute('aria-labelledby');
      
      if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
        issues.push(`Button ${index + 1} missing accessible name`);
      }
    });

    // Check for proper heading hierarchy
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const currentLevel = parseInt(heading.tagName.charAt(1));
      if (index === 0 && currentLevel !== 1) {
        issues.push('Page should start with h1');
      }
      if (currentLevel > previousLevel + 1) {
        issues.push(`Heading level jumps from h${previousLevel} to h${currentLevel}`);
      }
      previousLevel = currentLevel;
    });

    if (issues.length > 0) {
      issues.forEach(issue => {
        console.warn('A11y Check: Interactive element missing accessible name', element);
      });
    }
  }, [enableAccessibilityChecks]);

  // Performance measurement helper
  const measureAsync = useCallback(async <T,>(
    name: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> => {
    if (!enablePerformanceLogging) {
      return fn();
    }

    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`, context || '');
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`❌ ${name} failed after ${(end - start).toFixed(2)}ms:`, error);
      throw error;
    }
  }, [enablePerformanceLogging]);

  // Simulate slow network for testing
  const simulateSlowNetwork = useCallback(async (delay: number = 2000) => {
    // Always apply delay if explicitly called, even in tests
    await new Promise(resolve => setTimeout(resolve, delay));
  }, []);

  // Mock API response helper
  const createMockResponse = useCallback(<T,>(data: T, delay?: number): Promise<T> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay || 0);
    });
  }, []);

  // Generate test data
  const generateTestData = {
    user: () => ({
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      email: `test${Math.random().toString(36).substr(2, 5)}@example.com`,
      name: `Test User ${Math.floor(Math.random() * 1000)}`,
      plan: Math.random() > 0.5 ? 'premium' : 'free',
      created_at: new Date().toISOString(),
    }),
    product: () => ({
      id: `product-${Math.random().toString(36).substr(2, 9)}`,
      name: `Test Product ${Math.floor(Math.random() * 1000)}`,
      category: ['graos', 'laticinios', 'carnes', 'higiene'][Math.floor(Math.random() * 4)],
      unit: ['kg', 'litro', 'unidade'][Math.floor(Math.random() * 3)],
      price: Math.random() * 50 + 1,
    }),
    comparison: () => ({
      id: `comparison-${Math.random().toString(36).substr(2, 9)}`,
      products: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => 
        generateTestData.product()
      ),
      stores: ['Store A', 'Store B', 'Store C'].map(name => ({
        id: `store-${name.toLowerCase().replace(' ', '-')}`,
        name,
      })),
      totalSavings: Math.random() * 100,
      created_at: new Date().toISOString(),
    }),
  };

  // Environment checks
  const isTestEnvironment = process.env.NODE_ENV === 'test';
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  // Auto-run accessibility checks in development
  useEffect(() => {
    if (enableAccessibilityChecks && testRef.current) {
      const timer = setTimeout(() => {
        if (testRef.current) {
          checkAccessibility(testRef.current);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [checkAccessibility, enableAccessibilityChecks]);

  return {
    // Test utilities
    generateTestId,
    checkAccessibility,
    measureAsync,
    simulateSlowNetwork,
    createMockResponse,
    generateTestData,
    testRef,
    
    // Environment flags
    isTestEnvironment,
    isDevelopment,
    isProduction,
  };
};

// Test wrapper component
interface TestWrapperProps {
  children: React.ReactNode;
  testId?: string;
}

export const TestWrapper: React.FC<TestWrapperProps> = ({ children, testId }) => {
  const { checkAccessibility, testRef } = useTestingHelpers();

  useEffect(() => {
    if (testRef.current) {
      checkAccessibility(testRef.current);
    }
  }, [checkAccessibility]);

  return (
    <div data-testid={testId}>
      {children}
    </div>
  );
};

// Development simulation helpers
export const useDevSimulation = () => {
  const isDev = process.env.NODE_ENV === 'development';
  
  const simulateStates = {
    loading: (duration: number = 2000) => {
      // Always apply delay if explicitly called, even in tests
      return new Promise(resolve => setTimeout(resolve, duration));
    },
    
    error: (probability: number = 0.1) => {
      // Always evaluate probability, even in tests
      return Math.random() < probability;
    },
    
    randomDelay: (min: number = 100, max: number = 1000) => {
      // Always apply delay if explicitly called, even in tests
      const delay = Math.random() * (max - min) + min;
      return new Promise(resolve => setTimeout(resolve, delay));
    },
  };

  return {
    simulateStates,
    isDev,
  };
};