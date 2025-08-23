import React from "react";
import Navbar from "@/components/Navbar";
import ProductCatalogHeader from "@/components/product-catalog/ProductCatalogHeader";
import ProductFiltersSection from "@/components/product-catalog/ProductFiltersSection";
import ProductGrid from "@/components/product-catalog/ProductGrid";
import { useCategories } from "@/hooks/useCategories";
import { useOptimizedProductFilters } from "@/hooks/useProductSearch";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const ProductCatalog: React.FC = () => {
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const {
    filters,
    filteredProducts,
    availableCategories,
    filterStats,
    isLoading: productsLoading,
    setSearch,
    setCategory,
    setSorting,
    clearFilters
  } = useOptimizedProductFilters();

  // Debug logging
  React.useEffect(() => {
    console.log('ProductCatalog state:', {
      categoriesLoading,
      productsLoading,
      categoriesError,
      categoriesCount: categories?.length || 0,
      productsCount: filteredProducts?.length || 0,
      filterStats
    });
  }, [categoriesLoading, productsLoading, categoriesError, categories, filteredProducts, filterStats]);

  if (categoriesError) {
    console.error('Categories error:', categoriesError);
  }

  const isLoading = categoriesLoading || productsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 dark:from-background dark:via-muted/10 dark:to-accent/5">
      <Navbar />
      
      <div className="container mx-auto py-12 px-6">
        <ProductCatalogHeader />

        <ProductFiltersSection
          filters={filters}
          categories={categories || []}
          availableCategories={availableCategories}
          filterStats={filterStats}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onSortingChange={setSorting}
          onClearFilters={clearFilters}
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Carregando produtos..." />
          </div>
        ) : (
          <ProductGrid
            products={filteredProducts || []}
            isLoading={false}
            filterStats={filterStats}
            onClearFilters={clearFilters}
          />
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;