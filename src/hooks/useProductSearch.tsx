import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { productService } from '@/services/productService';
import { QUERY_KEYS } from '@/lib/queryConfig';

// Tipo para produto com campos normalizados
interface NormalizedProduct {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  created_at: string | null;
  prices: Record<string, number>;
}

// Hook para busca com debounce e cache
export const useProductSearch = (searchTerm: string, debounceMs: number = 300) => {
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  // Query com cache para busca
  const { data: searchResults = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.products.search(debouncedSearch),
    queryFn: async (): Promise<NormalizedProduct[]> => {
      if (!debouncedSearch.trim()) {
        return [];
      }
      try {
        const results = await productService.searchProducts(debouncedSearch);
        return results.map(product => ({
          ...product,
          category: product.category || 'outros',
          quantity: product.quantity ?? 1,
          unit: product.unit || 'unidade',
          prices: {} // Initialize empty prices object
        }));
      } catch (error) {
        console.error('Error searching products:', error);
        return [];
      }
    },
    enabled: debouncedSearch.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  });

  return {
    searchResults,
    isSearching: isLoading,
    searchError: error,
    debouncedSearch,
    hasSearchQuery: debouncedSearch.trim().length > 0
  };
};

// Hook para produtos por categoria com cache
export const useProductsByCategory = (category: string) => {
  const { data: categoryProducts = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.products.byCategory(category),
    queryFn: async (): Promise<NormalizedProduct[]> => {
      if (!category || category === 'all') {
        return [];
      }
      const results = await productService.getProductsByCategory(category);
      return results.map(product => ({
        ...product,
        category: product.category || 'outros',
        quantity: product.quantity ?? 1,
        unit: product.unit || 'unidade',
        prices: {} // Initialize empty prices object
      }));
    },
    enabled: !!category && category !== 'all',
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  return {
    categoryProducts,
    isLoading,
    error,
    hasCategory: !!category && category !== 'all'
  };
};

// Hook combinado para busca e filtros otimizado
export const useOptimizedProductFilters = () => {
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    sortBy: 'name' as 'name' | 'category' | 'created_at',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  // Query base para todos os produtos
  const { data: allProducts = [], isLoading: isLoadingAll } = useQuery({
    queryKey: QUERY_KEYS.products.all,
    queryFn: async (): Promise<NormalizedProduct[]> => {
      const products = await productService.getProducts();
      return products.map(product => ({
        ...product,
        category: product.category || 'outros',
        quantity: product.quantity ?? 1,
        unit: product.unit || 'unidade',
        prices: {} // Initialize empty prices object
      }));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Busca com debounce
  const { searchResults, isSearching, hasSearchQuery } = useProductSearch(filters.search);

  // Produtos por categoria
  const { categoryProducts, hasCategory } = useProductsByCategory(filters.category);

  // Produtos filtrados finais
  const filteredProducts = useMemo(() => {
    let products: NormalizedProduct[] = allProducts;

    // Se há busca, use os resultados da busca
    if (hasSearchQuery) {
      products = searchResults;
    }

    // Se há categoria, filtre por categoria
    if (hasCategory) {
      products = hasSearchQuery 
        ? searchResults.filter(p => p.category === filters.category)
        : categoryProducts;
    }

    // Ordenação
    const sorted = [...products].sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        case 'created_at':
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          comparison = dateA - dateB;
          break;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }, [allProducts, searchResults, categoryProducts, hasSearchQuery, hasCategory, filters]);

  // Categorias disponíveis
  const availableCategories = useMemo((): string[] => {
    const categories = new Set(allProducts.map(product => product.category));
    return Array.from(categories).sort();
  }, [allProducts]);

  // Estatísticas
  const filterStats = useMemo(() => ({
    totalProducts: allProducts.length,
    filteredProducts: filteredProducts.length,
    categoriesCount: availableCategories.length,
    hasActiveFilters: !!(filters.search || (filters.category && filters.category !== 'all'))
  }), [allProducts.length, filteredProducts.length, availableCategories.length, filters]);

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  return {
    filters,
    filteredProducts,
    availableCategories,
    filterStats,
    isLoading: isLoadingAll || isSearching,
    updateFilters,
    clearFilters,
    setSearch: (search: string) => updateFilters({ search }),
    setCategory: (category: string) => updateFilters({ category }),
    setSorting: (sortBy: typeof filters.sortBy, sortOrder: typeof filters.sortOrder) => 
      updateFilters({ sortBy, sortOrder })
  };
};
