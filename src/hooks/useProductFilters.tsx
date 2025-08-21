import { useState, useCallback, useMemo } from 'react';
import { Product, ProductFilters } from '@/lib/types';

export const useProductFilters = (products: Product[]) => {
  const [filters, setFilters] = useState<ProductFilters>({
    category: '',
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Filtrar produtos baseado nos filtros atuais
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filtrar por categoria
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(product => 
        product.category === filters.category
      );
    }

    // Filtrar por busca (nome do produto)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm)
      );
    }

    // Ordenar produtos
    filtered.sort((a, b) => {
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
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [products, filters]);

  // Obter categorias únicas dos produtos
  const availableCategories = useMemo(() => {
    const categories = new Set(products.map(product => product.category));
    return Array.from(categories).sort();
  }, [products]);

  // Atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      search: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  }, []);

  // Definir busca
  const setSearch = useCallback((search: string) => {
    updateFilters({ search });
  }, [updateFilters]);

  // Definir categoria
  const setCategory = useCallback((category: string) => {
    updateFilters({ category });
  }, [updateFilters]);

  // Definir ordenação
  const setSorting = useCallback((sortBy: ProductFilters['sortBy'], sortOrder: ProductFilters['sortOrder']) => {
    updateFilters({ sortBy, sortOrder });
  }, [updateFilters]);

  // Estatísticas dos filtros
  const filterStats = useMemo(() => ({
    totalProducts: products.length,
    filteredProducts: filteredProducts.length,
    categoriesCount: availableCategories.length,
    hasActiveFilters: !!(filters.search || filters.category)
  }), [products.length, filteredProducts.length, availableCategories.length, filters]);

  return {
    filters,
    filteredProducts,
    availableCategories,
    updateFilters,
    clearFilters,
    setSearch,
    setCategory,
    setSorting,
    filterStats
  };
};

// Hook para histórico de busca
export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('product-search-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addToHistory = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setSearchHistory(prev => {
      const updated = [searchTerm, ...prev.filter(item => item !== searchTerm)].slice(0, 10);
      localStorage.setItem('product-search-history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('product-search-history');
  }, []);

  const removeFromHistory = useCallback((searchTerm: string) => {
    setSearchHistory(prev => {
      const updated = prev.filter(item => item !== searchTerm);
      localStorage.setItem('product-search-history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    removeFromHistory
  };
};