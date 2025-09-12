import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOptimizedStores, useOptimizedProducts, useOptimizedUserComparisons } from '@/hooks/useOptimizedData';
import { AuthProvider } from '@/hooks/useAuth';
import React from 'react';

// Mock services
const mockStoreService = {
  getStores: vi.fn(),
};

const mockProductService = {
  getProducts: vi.fn(),
  searchProducts: vi.fn(),
};

const mockComparisonService = {
  getUserComparisons: vi.fn(),
};

// Mock useAuth hook
const mockUseAuth = vi.fn();

vi.mock('@/services/storeService', () => ({
  storeService: mockStoreService,
}));

vi.mock('@/services/productService', () => ({
  productService: mockProductService,
}));

vi.mock('@/services/comparisonService', () => ({
  comparisonService: mockComparisonService,
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: mockUseAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('useOptimizedData hooks', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user' },
      profile: { id: 'test-user', name: 'Test User' },
    });
  });

  describe('useOptimizedStores', () => {
    it('should fetch stores successfully', async () => {
      const mockStores = [
        { id: '1', name: 'Store 1' },
        { id: '2', name: 'Store 2' },
      ];
      
      mockStoreService.getStores.mockResolvedValue(mockStores);

      const { result } = renderHook(() => useOptimizedStores(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockStores);
      expect(mockStoreService.getStores).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when fetching stores', async () => {
      const mockError = new Error('Failed to fetch stores');
      mockStoreService.getStores.mockRejectedValue(mockError);

      const { result } = renderHook(() => useOptimizedStores(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });

    it('should show loading state initially', () => {
      mockStoreService.getStores.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useOptimizedStores(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useOptimizedProducts', () => {
    it('should fetch all products when no search term provided', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1' },
        { id: '2', name: 'Product 2' },
      ];
      
      mockProductService.getProducts.mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useOptimizedProducts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProducts);
      expect(mockProductService.getProducts).toHaveBeenCalledTimes(1);
      expect(mockProductService.searchProducts).not.toHaveBeenCalled();
    });

    it('should search products when search term provided', async () => {
      const searchTerm = 'rice';
      const mockSearchResults = [
        { id: '1', name: 'Rice Product 1' },
      ];
      
      mockProductService.searchProducts.mockResolvedValue(mockSearchResults);

      const { result } = renderHook(() => useOptimizedProducts(searchTerm), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSearchResults);
      expect(mockProductService.searchProducts).toHaveBeenCalledWith(searchTerm);
      expect(mockProductService.getProducts).not.toHaveBeenCalled();
    });

    it('should show loading state initially', () => {
      mockProductService.getProducts.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useOptimizedProducts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useOptimizedUserComparisons', () => {
    it('should fetch user comparisons when user is logged in', async () => {
      const mockComparisons = [
        { id: '1', name: 'Comparison 1' },
        { id: '2', name: 'Comparison 2' },
      ];
      
      mockComparisonService.getUserComparisons.mockResolvedValue(mockComparisons);

      const { result } = renderHook(() => useOptimizedUserComparisons(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockComparisons);
      expect(mockComparisonService.getUserComparisons).toHaveBeenCalledWith('test-user');
    });

    it('should return empty array when no user is logged in', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        profile: null,
      });

      const { result } = renderHook(() => useOptimizedUserComparisons(), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toEqual([]);
      expect(result.current.isSuccess).toBe(true);
      expect(mockComparisonService.getUserComparisons).not.toHaveBeenCalled();
    });

    it('should show loading state initially when user exists', () => {
      mockComparisonService.getUserComparisons.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useOptimizedUserComparisons(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });
  });
});