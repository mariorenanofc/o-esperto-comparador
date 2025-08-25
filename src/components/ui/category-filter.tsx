import React from 'react';
import { Check, Package2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Category } from '@/lib/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  showAllOption?: boolean;
  className?: string;
  variant?: 'select' | 'badges';
}

const categoryIcons: Record<string, string> = {
  'alimentos-basicos': '🌾',
  'carnes-peixes': '🥩',
  'laticinios-ovos': '🥛',
  'frutas-verduras': '🍎',
  'padaria-confeitaria': '🥐',
  'bebidas': '☕',
  'limpeza-higiene': '🧽',
  'enlatados-conservas': '🥫',
  'congelados': '❄️',
  'temperos-condimentos': '🌶️',
  'cereais-granolas': '🥣',
  'outros': '📦'
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  showAllOption = true,
  className = "",
  variant = 'select'
}) => {
  const getCategoryIcon = (categoryName: string) => {
    return categoryIcons[categoryName] || '📦';
  };

  const getCategoryDisplayName = (categoryName: string) => {
    const name = categoryName || 'outros';
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (variant === 'badges') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex flex-wrap gap-2">
          {showAllOption && (
            <Button
              variant={selectedCategory === '' || selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange('all')}
              className="h-8"
            >
              <Package2 className="mr-2 h-4 w-4" />
              Todas as categorias
            </Button>
          )}
          
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.name ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(category.name)}
              className="h-8"
            >
              <span className="mr-2">{getCategoryIcon(category.name)}</span>
              {getCategoryDisplayName(category.name)}
              {selectedCategory === category.name && (
                <Check className="ml-2 h-4 w-4" />
              )}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione uma categoria">
            {selectedCategory && selectedCategory !== 'all' ? (
              <div className="flex items-center gap-2">
                <span>{getCategoryIcon(selectedCategory)}</span>
                <span>{getCategoryDisplayName(selectedCategory)}</span>
              </div>
            ) : (
              "Todas as categorias"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {showAllOption && (
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Package2 className="h-4 w-4" />
                <span>Todas as categorias</span>
              </div>
            </SelectItem>
          )}
          
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.name}>
              <div className="flex items-center gap-2">
                <span>{getCategoryIcon(category.name)}</span>
                <span>{getCategoryDisplayName(category.name)}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Componente para mostrar categoria como badge
export const CategoryBadge: React.FC<{ category: string; size?: 'sm' | 'default' }> = ({ 
  category, 
  size = 'default' 
}) => {
  const getCategoryIcon = (categoryName: string) => {
    return categoryIcons[categoryName] || '📦';
  };

  const getCategoryDisplayName = (categoryName: string) => {
    return categoryName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Badge variant="secondary" className={size === 'sm' ? 'text-xs' : ''}>
      <span className="mr-1">{getCategoryIcon(category || 'outros')}</span>
      {getCategoryDisplayName(category || 'outros')}
    </Badge>
  );
};