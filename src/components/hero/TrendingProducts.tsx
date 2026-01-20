import React from "react";
import { TrendingUp, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const trendingProducts = [
  { name: "Arroz", icon: "🍚", searches: 1250 },
  { name: "Feijão", icon: "🫘", searches: 980 },
  { name: "Leite", icon: "🥛", searches: 850 },
  { name: "Açúcar", icon: "🧂", searches: 720 },
  { name: "Óleo", icon: "🫒", searches: 650 },
  { name: "Café", icon: "☕", searches: 580 },
];

export const TrendingProducts: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = (productName: string) => {
    navigate(`/comparison?search=${encodeURIComponent(productName)}`);
  };

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6" aria-label="Produtos em alta">
      <div className="flex items-center gap-2 text-muted-foreground mr-2">
        <Flame className="w-4 h-4 text-orange-500 animate-pulse" aria-hidden="true" />
        <span className="text-sm font-medium">Em alta:</span>
      </div>
      
      {trendingProducts.map((product) => (
        <Badge
          key={product.name}
          variant="secondary"
          onClick={() => handleClick(product.name)}
          className="cursor-pointer px-4 py-2 text-sm font-medium bg-white/80 dark:bg-gray-800/80 hover:bg-hero-primary/20 dark:hover:bg-hero-primary/30 border border-border/50 hover:border-hero-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-md backdrop-blur-sm"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick(product.name);
            }
          }}
          aria-label={`Buscar ${product.name}, ${product.searches}+ buscas`}
        >
          <span className="mr-1.5" aria-hidden="true">{product.icon}</span>
          {product.name}
          <span className="ml-2 text-xs text-muted-foreground" aria-hidden="true">
            {product.searches}+
          </span>
        </Badge>
      ))}
    </nav>
  );
};

export default TrendingProducts;
