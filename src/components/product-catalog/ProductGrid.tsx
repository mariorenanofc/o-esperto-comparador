import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/ui/category-filter";
import { Search } from "lucide-react";
import { Product } from "@/lib/types";

interface FilterStats {
  hasActiveFilters: boolean;
}

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  filterStats: FilterStats;
  onClearFilters: () => void;
  onProductClick?: (product: Product) => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  filterStats,
  onClearFilters,
  onProductClick,
  emptyStateTitle = "Nenhum produto encontrado",
  emptyStateDescription
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando produtos...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">{emptyStateTitle}</h3>
          <p className="text-muted-foreground mb-4">
            {emptyStateDescription || (filterStats.hasActiveFilters 
              ? "Tente ajustar os filtros para encontrar produtos."
              : "Não há produtos cadastrados ainda."
            )}
          </p>
          {filterStats.hasActiveFilters && (
            <Button onClick={onClearFilters} variant="outline">
              Limpar filtros
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card 
          key={product.id} 
          className={`hover:shadow-lg transition-shadow ${onProductClick ? 'cursor-pointer' : ''}`}
          onClick={() => onProductClick?.(product)}
        >
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
              
              {product.prices && Object.keys(product.prices).length > 0 && (
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
  );
};

export default ProductGrid;