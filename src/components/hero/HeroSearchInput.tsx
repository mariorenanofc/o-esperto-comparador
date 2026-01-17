import React, { useState, useEffect, useRef } from "react";
import { Search, TrendingUp, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Suggestion {
  id: string;
  name: string;
  category: string;
}

interface HeroSearchInputProps {
  onSearch?: (query: string) => void;
}

export const HeroSearchInput: React.FC<HeroSearchInputProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch suggestions from database
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, category")
          .ilike("name", `%${query}%`)
          .limit(6);

        if (!error && data) {
          setSuggestions(data);
        }
      } catch (err) {
        // Silent fail for suggestions
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch?.(query);
      navigate(`/comparison?search=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        setQuery(suggestions[selectedIndex].name);
        handleSearch();
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    navigate(`/comparison?search=${encodeURIComponent(suggestion.name)}`);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-hero-primary via-hero-accent to-hero-secondary rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse-glow" />
        
        {/* Input container */}
        <div className="relative flex items-center bg-white dark:bg-gray-900 rounded-xl shadow-2xl border-2 border-transparent hover:border-hero-primary/30 transition-all duration-300">
          <div className="flex items-center pl-5 text-hero-primary">
            <Search className="w-6 h-6" />
          </div>
          
          <Input
            ref={inputRef}
            type="text"
            placeholder="Busque um produto... ex: arroz, leite, feijão"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            className="flex-1 border-0 bg-transparent text-lg py-6 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
          />
          
          {isLoading && (
            <Loader2 className="w-5 h-5 mr-2 text-muted-foreground animate-spin" />
          )}
          
          <Button
            onClick={handleSearch}
            className="m-2 px-6 py-6 bg-gradient-to-r from-hero-primary to-hero-accent hover:from-hero-primary/90 hover:to-hero-accent/90 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Search className="w-5 h-5 mr-2" />
            Buscar
          </Button>
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-border/50 overflow-hidden z-50 animate-fade-in"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                "w-full px-5 py-3 flex items-center gap-3 hover:bg-hero-primary/10 transition-colors text-left",
                selectedIndex === index && "bg-hero-primary/10"
              )}
            >
              <TrendingUp className="w-4 h-4 text-hero-primary" />
              <div>
                <span className="font-medium text-foreground">{suggestion.name}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  em {suggestion.category}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSearchInput;
