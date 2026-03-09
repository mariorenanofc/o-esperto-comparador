import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { SEOHead } from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, TrendingDown, TrendingUp, Minus, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface OfferResult {
  id: string;
  product_name: string;
  store_name: string;
  price: number;
  city: string;
  state: string;
  created_at: string;
  contributor_name: string;
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["search-offers", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const { data, error } = await supabase
        .from("daily_offers")
        .select("id, product_name, store_name, price, city, state, created_at, contributor_name")
        .eq("verified", true)
        .ilike("product_name", `%${searchTerm}%`)
        .order("price", { ascending: true })
        .limit(50);
      if (error) throw error;
      return (data || []) as OfferResult[];
    },
    enabled: searchTerm.trim().length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
    setSearchParams(query ? { q: query } : {});
  };

  // Calculate price benchmarks
  const prices = results.map((r) => r.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

  // Group by store
  const byStore = results.reduce<Record<string, OfferResult[]>>((acc, r) => {
    const key = `${r.store_name} - ${r.city}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const getPriceBadge = (price: number) => {
    if (avgPrice === 0) return null;
    const diff = ((price - avgPrice) / avgPrice) * 100;
    if (diff <= -5) return <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"><TrendingDown className="w-3 h-3 mr-1" />{Math.abs(diff).toFixed(0)}% abaixo</Badge>;
    if (diff >= 5) return <Badge variant="destructive" className="bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"><TrendingUp className="w-3 h-3 mr-1" />{diff.toFixed(0)}% acima</Badge>;
    return <Badge variant="secondary"><Minus className="w-3 h-3 mr-1" />Na média</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Buscar Preços | O Esperto Comparador" description="Busque e compare preços de produtos em diferentes mercados da sua região." />
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">Buscar Preços</h1>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: arroz, leite, café..."
            className="text-base"
          />
          <Button type="submit" disabled={isLoading}>
            <SearchIcon className="w-4 h-4 mr-2" />
            Buscar
          </Button>
        </form>

        {searchTerm && results.length > 0 && (
          <>
            {/* Price benchmarks */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="border-emerald-500/30 bg-emerald-500/5">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Menor preço</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">R$ {minPrice.toFixed(2).replace(".", ",")}</p>
                </CardContent>
              </Card>
              <Card className="border-blue-500/30 bg-blue-500/5">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Preço médio</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">R$ {avgPrice.toFixed(2).replace(".", ",")}</p>
                </CardContent>
              </Card>
              <Card className="border-red-500/30 bg-red-500/5">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Maior preço</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">R$ {maxPrice.toFixed(2).replace(".", ",")}</p>
                </CardContent>
              </Card>
            </div>

            {/* Results by store */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{results.length} resultado(s) encontrado(s)</p>
              {Object.entries(byStore).map(([storeName, offers]) => (
                <Card key={storeName} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{storeName.split(" - ")[0]}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {offers[0].city}, {offers[0].state}
                        </p>
                      </div>
                      <div className="text-right">
                        {offers.map((offer) => (
                          <div key={offer.id} className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-muted-foreground">{offer.product_name}</span>
                            <span className="font-bold text-foreground">R$ {offer.price.toFixed(2).replace(".", ",")}</span>
                            {getPriceBadge(offer.price)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {searchTerm && !isLoading && results.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Nenhum resultado para "{searchTerm}"
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Ainda não temos preços registrados para esse produto. Que tal ser o primeiro a contribuir?
            </p>
          </div>
        )}

        {!searchTerm && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🏪</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Compare preços em segundos
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Busque um produto para ver os preços em diferentes mercados da sua região.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Buscando preços...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
