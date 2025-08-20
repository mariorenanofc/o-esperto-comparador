import React from "react";
import Navbar from "@/components/Navbar";
import ProductCatalogHeader from "@/components/product-catalog/ProductCatalogHeader";
import ProductFiltersSection from "@/components/product-catalog/ProductFiltersSection";
import ProductGrid from "@/components/product-catalog/ProductGrid";
import { useCategories } from "@/hooks/useCategories";
import { useOptimizedProductFilters } from "@/hooks/useProductSearch";

const ProductCatalog: React.FC = () => {
  const { categories } = useCategories();
  const {
    filters,
    filteredProducts,
    availableCategories,
    filterStats,
    isLoading,
    setSearch,
    setCategory,
    setSorting,
    clearFilters
  } = useOptimizedProductFilters();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 dark:from-background dark:via-muted/10 dark:to-accent/5">
      <Navbar />
      
      <div className="container mx-auto py-12 px-6">
        <ProductCatalogHeader />

        <ProductFiltersSection
          filters={filters}
          categories={categories}
          availableCategories={availableCategories}
          filterStats={filterStats}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onSortingChange={setSorting}
          onClearFilters={clearFilters}
        />

        <ProductGrid
          products={filteredProducts}
          isLoading={isLoading}
          filterStats={filterStats}
          onClearFilters={clearFilters}
        />
      </div>
    </div>
  );
};

export default ProductCatalog;