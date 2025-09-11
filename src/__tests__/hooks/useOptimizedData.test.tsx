import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOptimizedStores, useOptimizedProducts, useOptimizedUserComparisons } from '@/hooks/useOptimizedData';
import { AuthProvider } from '@/hooks/useAuth';
import { mockUser, mockProfile } from '@/test/testUtils';
import React from 'react';

// Mock services
const mockStoreService = {
  getStores: vi.fn(),
};

const mockProductService = {
  getProducts: vi.fn(),
  searchProducts: vi.fn(),
};

vi.mock('@/services/storeService', () => ({
  storeService: mockStoreService,
}));

vi.mock('@/services/productService', () => ({
  productService: mockProductService,
}));

vi.mock('@/services/comparisonService', () => ({
  getUserComparisons: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    profile: mockProfile,
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
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

describe('useOptimizedData hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockStores);
      expect(mockStoreService.getStores).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch stores error', async () => {
      const error = new Error('Failed to fetch stores');
      mockStoreService.getStores.mockRejectedValue(error);

      const { result } = renderHook(() => useOptimizedStores(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useOptimizedProducts', () => {
    it('should fetch all products when no search term', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', category: 'category1' },
        { id: '2', name: 'Product 2', category: 'category2' },
      ];

      mockProductService.getProducts.mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useOptimizedProducts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockProducts);
      expect(mockProductService.getProducts).toHaveBeenCalledTimes(1);
    });

    it('should search products when search term provided', async () => {
      const searchTerm = 'rice';
      const mockSearchResults = [
        { id: '1', name: 'Rice Product', category: 'grains' },
      ];

      mockProductService.searchProducts.mockResolvedValue(mockSearchResults);

      const { result } = renderHook(() => useOptimizedProducts(searchTerm), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockSearchResults);
      expect(mockProductService.searchProducts).toHaveBeenCalledWith(searchTerm);
    });
  });

  describe('useOptimizedUserComparisons', () => {
    it('should fetch user comparisons when user is logged in', async () => {
      const mockComparisons = [
        { 
          id: '1', 
          user_id: mockUser.id,
          title: 'Comparison 1',
          date: new Date(),
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          location: 'Test Location',
          products: [],
          stores: []
        },
      ];

      const { getUserComparisons } = await import('@/services/comparisonService');
      vi.mocked(getUserComparisons).mockResolvedValue(mockComparisons as any);

      const { result } = renderHook(() => useOptimizedUserComparisons(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockComparisons);
    });

    it('should return empty array when no user', async () => {
      vi.mocked(require('@/hooks/useAuth').useAuth).mockReturnValue({
        user: null,
        profile: null,
        loading: false,
      });

      const { result } = renderHook(() => useOptimizedUserComparisons(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
    });
  });
});