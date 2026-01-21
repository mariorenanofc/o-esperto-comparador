import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Apple, 
  Milk, 
  Beef, 
  Fish, 
  Cookie, 
  Coffee, 
  ShoppingBasket,
  Wheat,
  Candy,
  IceCream,
  Egg,
  Carrot,
  Wine,
  Sparkles,
  Home,
  Baby,
  PawPrint,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Product } from "@/lib/types";
import { groupDuplicateProducts, formatVariantText, GroupedProduct } from "@/lib/productNormalization";

interface FilterStats {
  totalProducts?: number;
  filteredProducts?: number;
  categoriesCount?: number;
  hasActiveFilters: boolean;
}

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  filterStats: FilterStats;
  onClearFilters: () => void;
  onProductClick?: (product: Product) => void;
  itemsPerPage?: number;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  groupDuplicates?: boolean;
}

// Map categories to icons
const categoryIcons: Record<string, React.ElementType> = {
  'frutas': Apple,
  'verduras': Carrot,
  'legumes': Carrot,
  'hortifruti': Apple,
  'laticinios': Milk,
  'laticínios': Milk,
  'leite': Milk,
  'carnes': Beef,
  'carne': Beef,
  'açougue': Beef,
  'peixes': Fish,
  'peixe': Fish,
  'frutos do mar': Fish,
  'padaria': Cookie,
  'pães': Cookie,
  'paes': Cookie,
  'biscoitos': Cookie,
  'bolachas': Cookie,
  'cafe': Coffee,
  'café': Coffee,
  'bebidas': Coffee,
  'cereais': Wheat,
  'grãos': Wheat,
  'graos': Wheat,
  'massas': Wheat,
  'doces': Candy,
  'chocolates': Candy,
  'bomboniere': Candy,
  'congelados': IceCream,
  'sorvetes': IceCream,
  'ovos': Egg,
  'bebidas alcoólicas': Wine,
  'bebidas alcoolicas': Wine,
  'vinhos': Wine,
  'cervejas': Wine,
  'limpeza': Sparkles,
  'higiene': Sparkles,
  'perfumaria': Sparkles,
  'casa': Home,
  'utilidades': Home,
  'bebe': Baby,
  'bebê': Baby,
  'infantil': Baby,
  'pet': PawPrint,
  'animais': PawPrint,
  'mercearia': ShoppingBasket,
  'outros': Package,
};

const getCategoryIcon = (category: string): React.ElementType => {
  const lowerCategory = category.toLowerCase();
  
  // Check for exact match first
  if (categoryIcons[lowerCategory]) {
    return categoryIcons[lowerCategory];
  }
  
  // Check for partial match
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (lowerCategory.includes(key) || key.includes(lowerCategory)) {
      return icon;
    }
  }
  
  return Package;
};

const getCategoryColor = (category: string): string => {
  const lowerCategory = category.toLowerCase();
  
  if (lowerCategory.includes('fruta') || lowerCategory.includes('hortifruti')) {
    return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
  }
  if (lowerCategory.includes('carne') || lowerCategory.includes('açougue')) {
    return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
  }
  if (lowerCategory.includes('latic') || lowerCategory.includes('leite')) {
    return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
  }
  if (lowerCategory.includes('padaria') || lowerCategory.includes('pão') || lowerCategory.includes('pao')) {
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  }
  if (lowerCategory.includes('bebida') || lowerCategory.includes('café') || lowerCategory.includes('cafe')) {
    return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
  }
  if (lowerCategory.includes('limpeza') || lowerCategory.includes('higiene')) {
    return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
  }
  if (lowerCategory.includes('doce') || lowerCategory.includes('chocolate')) {
    return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20';
  }
  if (lowerCategory.includes('congelado') || lowerCategory.includes('sorvete')) {
    return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
  }
  
  return 'bg-muted text-muted-foreground border-border';
};

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  filterStats,
  onClearFilters,
  onProductClick,
  itemsPerPage = 12,
  emptyStateTitle = "Nenhum produto encontrado",
  emptyStateDescription,
  groupDuplicates = true
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Agrupa produtos duplicados se habilitado
  const displayProducts = useMemo(() => {
    if (!groupDuplicates) return products.map(p => ({ ...p, variantCount: 1, variants: [p], displayName: p.name }));
    return groupDuplicateProducts(products as any) as (Product & { variantCount: number; variants: Product[]; displayName: string })[];
  }, [products, groupDuplicates]);
  
  // Reset to page 1 when products change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [displayProducts.length, filterStats.hasActiveFilters]);

  // Pagination logic
  const totalPages = Math.ceil(displayProducts.length / itemsPerPage);
  
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return displayProducts.slice(startIndex, endIndex);
  }, [displayProducts, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of grid
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (displayProducts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-muted/50 to-muted/30 border-dashed">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{emptyStateTitle}</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {emptyStateDescription || (filterStats.hasActiveFilters 
              ? "Tente ajustar os filtros para ver mais resultados"
              : "Ainda não há produtos cadastrados no catálogo"
            )}
          </p>
          {filterStats.hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={onClearFilters}
              className="gap-2"
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              Limpar filtros
            </Button>
          )}
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info sobre agrupamento */}
      {groupDuplicates && displayProducts.length < products.length && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
          <Layers className="h-4 w-4" aria-hidden="true" />
          <span>
            {products.length} produtos agrupados em {displayProducts.length} itens únicos
          </span>
        </div>
      )}

      {/* Products Grid - 3 columns */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        {paginatedProducts.map((product, index) => {
          const CategoryIcon = getCategoryIcon(product.category);
          const colorClass = getCategoryColor(product.category);
          
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
            >
              <Card 
                className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden h-full"
                onClick={() => onProductClick?.(product)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Category Icon */}
                    <div className={`p-3 rounded-xl border shrink-0 ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
                      <CategoryIcon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {(product as any).displayName || product.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {product.quantity} {product.unit}
                        </span>
                        {/* Indicador de variantes */}
                        {(product as any).variantCount > 1 && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-primary/10 text-primary border-primary/20"
                          >
                            <Layers className="h-3 w-3 mr-1" aria-hidden="true" />
                            {formatVariantText((product as any).variantCount)}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="mt-3">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs truncate max-w-full ${colorClass}`}
                        >
                          {product.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-col items-center gap-4 pt-4"
        >
          {/* Page info */}
          <p className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, displayProducts.length)} de {displayProducts.length} {groupDuplicates ? 'itens' : 'produtos'}
          </p>
          
          {/* Pagination controls */}
          <Pagination>
            <PaginationContent className="flex-wrap justify-center gap-1">
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>
              </PaginationItem>
              
              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => goToPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  <span className="hidden sm:inline">Próximo</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </motion.div>
      )}
    </div>
  );
};

export default ProductGrid;
