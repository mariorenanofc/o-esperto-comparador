import React from "react";
import Navbar from "@/components/Navbar";
import { ProductSearch } from "@/components/ui/product-search";
import { CategoryFilter, CategoryBadge } from "@/components/ui/category-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProductFilters, useSearchHistory } from "@/hooks/useProductFilters";
import { useCategories } from "@/hooks/useCategories";
import { productService } from "@/services/productService";
import { useQuery } from "@tanstack/react-query";
import { Package, Filter, Search, TrendingUp } from "lucide-react";

const ProductCatalog: React.FC = () => {
  const { categories } = useCategories();
  const { searchHistory } = useSearchHistory();
  
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const rawProducts = await productService.getProducts();
      // Transform products to include prices field
      return rawProducts.map(product => ({
        ...product,
        prices: {} // Initialize empty prices object
      }));
    }
  });

  const {
    filters,
    filteredProducts,
    availableCategories,
    setSearch,
    setCategory,
    setSorting,
    clearFilters,
    filterStats
  } = useProductFilters(products);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 dark:from-background dark:via-muted/10 dark:to-accent/5">
      <Navbar />
      
      <div className="container mx-auto py-12 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-app-primary via-app-secondary to-app-success bg-clip-text text-transparent mb-6">
            📦 Catálogo de Produtos
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore nossa base de produtos e descubra informações sobre preços e disponibilidade.
          </p>
        </div>

        {/* Filters Section */}
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
                onChange={setSearch}
                placeholder="Buscar produtos..."
                className="flex-1"
              />
              <CategoryFilter
                categories={categories}
                selectedCategory={filters.category}
                onCategoryChange={setCategory}
                className="lg:w-64"
              />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {filteredProducts.length} de {filterStats.totalProducts} produtos encontrados
                {filterStats.hasActiveFilters && (
                  <span className="ml-2">
                    (filtros aplicados)
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => setSorting(e.target.value as any, filters.sortOrder)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="name">Nome</option>
                  <option value="category">Categoria</option>
                  <option value="created_at">Data de criação</option>
                </select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSorting(filters.sortBy, filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
                
                {filterStats.hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </div>

            {/* Quick filters */}
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
                        onClick={() => setSearch(term)}
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
                    onCategoryChange={setCategory}
                    variant="badges"
                    className="flex-wrap"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {filterStats.hasActiveFilters 
                  ? "Tente ajustar os filtros para encontrar produtos."
                  : "Não há produtos cadastrados ainda."
                }
              </p>
              {filterStats.hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Limpar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">
                      {product.name}
                    </CardTitle>
                    <CategoryBadge category={product.category} size="sm" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Quantidade:</span>
                      <span className="font-medium">{product.quantity} {product.unit}</span>
                    </div>
                    
                    {Object.keys(product.prices).length > 0 && (
                      <div className="pt-2 border-t">
                        <span className="font-medium text-foreground">Preços disponíveis:</span>
                        <div className="mt-1 space-y-1">
                          {Object.entries(product.prices).map(([storeId, price]) => (
                            <div key={storeId} className="flex justify-between text-xs">
                              <span>Loja {storeId.slice(-4)}</span>
                              <span className="font-medium text-app-success">
                                R$ {price.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;