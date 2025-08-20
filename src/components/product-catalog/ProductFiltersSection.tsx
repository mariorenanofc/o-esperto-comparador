import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductSearch } from "@/components/ui/product-search";
import { CategoryFilter } from "@/components/ui/category-filter";
import { Filter, TrendingUp, Package } from "lucide-react";
import { useSearchHistory } from "@/hooks/useProductFilters";
import { Category } from "@/lib/types";

interface FilterStats {
  totalProducts: number;
  filteredProducts: number;
  categoriesCount: number;
  hasActiveFilters: boolean;
}

interface Filters {
  search: string;
  category: string;
  sortBy: 'name' | 'category' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

interface ProductFiltersSectionProps {
  filters: Filters;
  categories: Category[];
  availableCategories: string[];
  filterStats: FilterStats;
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: string) => void;
  onSortingChange: (sortBy: Filters['sortBy'], sortOrder: Filters['sortOrder']) => void;
  onClearFilters: () => void;
  showQuickFilters?: boolean;
}

const ProductFiltersSection: React.FC<ProductFiltersSectionProps> = ({
  filters,
  categories,
  availableCategories,
  filterStats,
  onSearchChange,
  onCategoryChange,
  onSortingChange,
  onClearFilters,
  showQuickFilters = true
}) => {
  const { searchHistory } = useSearchHistory();

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros e Busca
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <ProductSearch
            value={filters.search}
            onChange={onSearchChange}
            placeholder="Buscar produtos..."
            className="flex-1"
            showHistory={true}
          />
          <CategoryFilter
            categories={categories}
            selectedCategory={filters.category}
            onCategoryChange={onCategoryChange}
            className="lg:w-64"
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {filterStats.filteredProducts} de {filterStats.totalProducts} produtos encontrados
            {filterStats.hasActiveFilters && (
              <span className="ml-2">
                (filtros aplicados)
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => onSortingChange(e.target.value as Filters['sortBy'], filters.sortOrder)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="name">Nome</option>
              <option value="category">Categoria</option>
              <option value="created_at">Data de criação</option>
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSortingChange(filters.sortBy, filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
            
            {filterStats.hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Quick filters */}
        {showQuickFilters && (
          <div className="space-y-3">
            {searchHistory.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Buscas recentes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.slice(0, 5).map((term, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => onSearchChange(term)}
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {availableCategories.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Categorias disponíveis
                </h4>
                <CategoryFilter
                  categories={categories.filter(cat => availableCategories.includes(cat.name))}
                  selectedCategory={filters.category}
                  onCategoryChange={onCategoryChange}
                  variant="badges"
                  className="flex-wrap"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductFiltersSection;