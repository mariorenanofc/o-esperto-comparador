import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, Trash2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useSearchHistory } from '@/hooks/useProductFilters';
import { useProductSearch } from '@/hooks/useProductSearch';
import { Product } from '@/lib/types';

interface ProductSearchSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onSelectProduct?: (product: Product) => void;
  placeholder?: string;
  className?: string;
  showHistory?: boolean;
  showSuggestions?: boolean;
}

export const ProductSearchSuggestions: React.FC<ProductSearchSuggestionsProps> = ({
  value,
  onChange,
  onSelectProduct,
  placeholder = "Buscar produtos...",
  className = "",
  showHistory = true,
  showSuggestions = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { searchHistory, addToHistory, clearHistory, removeFromHistory } = useSearchHistory();
  
  // Use product search with debounce for suggestions
  const { searchResults, isSearching } = useProductSearch(
    showSuggestions && value.length > 2 ? value : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      addToHistory(value.trim());
      setIsOpen(false);
    }
  };

  const handleHistorySelect = (searchTerm: string) => {
    onChange(searchTerm);
    setIsOpen(false);
    addToHistory(searchTerm);
  };

  const handleProductSelect = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
      onChange('');
      setIsOpen(false);
      addToHistory(product.name);
    }
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const showPopover = isOpen && (searchHistory.length > 0 || (searchResults && searchResults.length > 0));

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-10 pr-10"
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-transparent"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {showPopover && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div className="absolute inset-0 pointer-events-none" />
          </PopoverTrigger>
          <PopoverContent 
            className="w-full p-2" 
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="space-y-2">
              {/* Product suggestions */}
              {showSuggestions && searchResults && searchResults.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Search className="h-4 w-4" />
                    <span>Produtos encontrados</span>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {searchResults.slice(0, 5).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between group hover:bg-accent rounded-sm p-2 cursor-pointer"
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {product.quantity} {product.unit} • {product.category}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {searchHistory.length > 0 && <div className="border-t pt-2" />}
                </div>
              )}

              {/* Search history */}
              {showHistory && searchHistory.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Buscas recentes</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearHistory}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    {searchHistory.slice(0, 5).map((searchTerm, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between group hover:bg-accent rounded-sm p-2 cursor-pointer"
                        onClick={() => handleHistorySelect(searchTerm)}
                      >
                        <span className="text-sm truncate flex-1">{searchTerm}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromHistory(searchTerm);
                          }}
                          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading state */}
              {isSearching && (
                <div className="text-sm text-muted-foreground p-2">
                  Buscando produtos...
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};