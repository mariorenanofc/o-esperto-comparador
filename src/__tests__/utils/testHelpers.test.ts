import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTestingHelpers, useDevSimulation } from '@/hooks/useTestingHelpers';

describe('useTestingHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate test IDs when enabled', () => {
    const { result } = renderHook(() => useTestingHelpers({ 
      enableTestIds: true 
    }));

    const testId = result.current.generateTestId('button');
    expect(testId).toMatch(/button-\d+/);
  });

  it('should not generate test IDs when disabled', () => {
    const { result } = renderHook(() => useTestingHelpers({ 
      enableTestIds: false 
    }));

    const testId = result.current.generateTestId('button');
    expect(testId).toBeUndefined();
  });

  it('should perform accessibility checks when enabled', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const { result } = renderHook(() => useTestingHelpers({ 
      enableTestIds: true 
    }));

    const mockElement = document.createElement('button');
    // Missing aria-label should trigger warning
    result.current.checkAccessibility(mockElement);

    expect(consoleSpy).toHaveBeenCalledWith(
      'A11y Check: Interactive element missing accessible name',
      mockElement
    );

    consoleSpy.mockRestore();
  });

  it('should measure async operation performance', async () => {
    const { result } = renderHook(() => useTestingHelpers({ 
      enableTestIds: true 
    }));

    const mockAsyncFn = vi.fn().mockResolvedValue('result');
    
    const startTime = performance.now();
    const resultValue = await result.current.measureAsync('test-operation', mockAsyncFn);
    const endTime = performance.now();

    expect(mockAsyncFn).toHaveBeenCalled();
    expect(resultValue).toBe('result');
    // Should complete within reasonable time
    expect(endTime - startTime).toBeLessThan(100);
  });

  it('should simulate slow network', async () => {
    const { result } = renderHook(() => useTestingHelpers());

    const startTime = performance.now();
    await result.current.simulateSlowNetwork(50);
    const endTime = performance.now();

    expect(endTime - startTime).toBeGreaterThanOrEqual(50);
  });

  it('should create mock response with delay', async () => {
    const { result } = renderHook(() => useTestingHelpers());

    const mockData = { id: 1, name: 'test' };
    
    const startTime = performance.now();
    const response = await result.current.createMockResponse(mockData, 30);
    const endTime = performance.now();

    expect(response).toEqual(mockData);
    expect(endTime - startTime).toBeGreaterThanOrEqual(30);
  });

  it('should generate test data', () => {
    const { result } = renderHook(() => useTestingHelpers());

    const user = result.current.generateTestData.user();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('name');

    const product = result.current.generateTestData.product();
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('category');

    const comparison = result.current.generateTestData.comparison();
    expect(comparison).toHaveProperty('id');
    expect(comparison).toHaveProperty('products');
    expect(comparison).toHaveProperty('stores');
  });

  it('should detect environment flags correctly', () => {
    const { result } = renderHook(() => useTestingHelpers());

    expect(typeof result.current.isTestEnvironment).toBe('boolean');
    expect(typeof result.current.isDevelopment).toBe('boolean');
    expect(typeof result.current.isProduction).toBe('boolean');
  });
});

describe('useDevSimulation', () => {
  it('should provide simulation utilities', () => {
    const { result } = renderHook(() => useDevSimulation());

    expect(result.current.simulateStates).toHaveProperty('loading');
    expect(result.current.simulateStates).toHaveProperty('error');
    expect(result.current.simulateStates).toHaveProperty('randomDelay');
    expect(typeof result.current.isDev).toBe('boolean');
  });

  it('should simulate loading state', async () => {
    const { result } = renderHook(() => useDevSimulation());

    const startTime = performance.now();
    await result.current.simulateStates.loading(100);
    const endTime = performance.now();

    expect(endTime - startTime).toBeGreaterThanOrEqual(100);
  });

  it('should simulate error state', () => {
    const { result } = renderHook(() => useDevSimulation());

    expect(() => {
      result.current.simulateStates.error(new Error('Test error'));
    }).toThrow('Test error');
  });

  it('should simulate random delay', async () => {
    const { result } = renderHook(() => useDevSimulation());

    const startTime = performance.now();
    await result.current.simulateStates.randomDelay(50, 100);
    const endTime = performance.now();

    const duration = endTime - startTime;
    expect(duration).toBeGreaterThanOrEqual(50);
    expect(duration).toBeLessThanOrEqual(150); // Allow some overhead
  });
});