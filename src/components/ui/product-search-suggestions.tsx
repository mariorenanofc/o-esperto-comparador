import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Clock, Trash2, Plus, TrendingUp, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearchHistory } from '@/hooks/useProductFilters';
import { useProductSearch } from '@/hooks/useProductSearch';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProductSearchSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onSelectProduct?: (product: Product) => void;
  placeholder?: string;
  className?: string;
  showHistory?: boolean;
  showSuggestions?: boolean;
}

// Popular search terms
const TRENDING_SEARCHES = [
  'Arroz', 'Feijão', 'Leite', 'Óleo', 'Açúcar', 'Café', 'Macarrão', 'Farinha'
];

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
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { searchHistory, addToHistory, clearHistory, removeFromHistory } = useSearchHistory();
  
  // Use product search with debounce for suggestions
  const { searchResults, isSearching, searchError, hasSearchQuery } = useProductSearch(
    showSuggestions && value.length > 1 ? value : '', 200
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Computed suggestions
  const suggestions = useMemo(() => {
    if (hasSearchQuery && searchResults.length > 0) {
      return searchResults.slice(0, 8).map(p => ({
        type: 'product' as const,
        id: p.id,
        text: p.name,
        category: p.category,
        product: p
      }));
    }

    // Show history and trending when no search
    const historySuggestions = searchHistory.slice(0, 5).map(h => ({
      type: 'history' as const,
      id: h,
      text: h
    }));

    const trendingSuggestions = TRENDING_SEARCHES
      .filter(t => !searchHistory.includes(t))
      .slice(0, 5 - historySuggestions.length)
      .map(t => ({
        type: 'trending' as const,
        id: t,
        text: t
      }));

    return [...historySuggestions, ...trendingSuggestions];
  }, [searchResults, hasSearchQuery, searchHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      addToHistory(value.trim());
      setIsOpen(false);
    }
  };

  const handleSuggestionSelect = (suggestion: typeof suggestions[0]) => {
    if (suggestion.type === 'product') {
      const productSuggestion = suggestion as { type: 'product'; product: Product };
      if (onSelectProduct) {
        onSelectProduct(productSuggestion.product);
      }
      onChange(suggestion.text);
      addToHistory(suggestion.text);
    } else {
      onChange(suggestion.text);
      addToHistory(suggestion.text);
    }
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else if (value.trim()) {
          addToHistory(value.trim());
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const highlightMatch = (text: string) => {
    if (!value) return text;
    const regex = new RegExp(`(${value})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <span key={i} className="bg-primary/20 text-primary font-medium">{part}</span>
      ) : part
    );
  };

  const showDropdown = isOpen && (suggestions.length > 0 || isSearching || (hasSearchQuery && searchResults.length === 0));

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-10 pr-10 h-11"
          />
          {isSearching && (
            <Loader2 className="absolute right-10 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          <ScrollArea className="max-h-80">
            {/* History Section Header */}
            {!hasSearchQuery && searchHistory.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Buscas recentes</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="h-5 text-xs px-2"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              </div>
            )}

            {/* Search Results Header */}
            {hasSearchQuery && searchResults.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span>{searchResults.length} produtos encontrados</span>
              </div>
            )}

            {/* Suggestions List */}
            {suggestions.length > 0 && (
              <div className="py-1">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.type}-${suggestion.id}`}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors group",
                      selectedIndex === index 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-accent/50"
                    )}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {suggestion.type === 'history' && (
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      {suggestion.type === 'trending' && (
                        <TrendingUp className="h-4 w-4 text-orange-500 shrink-0" />
                      )}
                      {suggestion.type === 'product' && (
                        <Search className="h-4 w-4 text-primary shrink-0" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">
                          {suggestion.type === 'product' ? highlightMatch(suggestion.text) : suggestion.text}
                        </p>
                        {suggestion.type === 'product' && (suggestion as any).category && (
                          <p className="text-xs text-muted-foreground truncate">
                            {(suggestion as any).category}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {suggestion.type === 'history' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromHistory(suggestion.text);
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                      {suggestion.type === 'trending' && (
                        <Badge variant="secondary" className="text-xs">
                          Popular
                        </Badge>
                      )}
                      {suggestion.type === 'product' && onSelectProduct && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Trending Section (when no history) */}
            {!hasSearchQuery && searchHistory.length === 0 && (
              <div className="px-3 py-3 bg-muted/30">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>Produtos populares</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_SEARCHES.slice(0, 6).map(term => (
                    <Badge
                      key={term}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => {
                        onChange(term);
                        addToHistory(term);
                        setIsOpen(false);
                      }}
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {hasSearchQuery && !isSearching && searchResults.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum produto encontrado para "{value}"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tente buscar por outro termo
                </p>
              </div>
            )}

            {/* Loading state */}
            {isSearching && (
              <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando produtos...
              </div>
            )}

            {/* Search error */}
            {searchError && (
              <div className="text-sm text-destructive p-4 text-center">
                Erro ao buscar produtos. Tente novamente.
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};