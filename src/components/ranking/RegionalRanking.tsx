import React from "react";
import { TrendingDown, MapPin, Store, Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { rankingService, StoreRanking } from "@/services/rankingService";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Skeleton } from "@/components/ui/skeleton";

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  const colors = {
    1: "from-yellow-400 to-amber-500",
    2: "from-gray-300 to-slate-400",
    3: "from-amber-600 to-orange-600",
  };

  const icons = {
    1: "🥇",
    2: "🥈",
    3: "🥉",
  };

  if (rank <= 3) {
    return (
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[rank as 1|2|3]} flex items-center justify-center shadow-lg text-xl`}>
        {icons[rank as 1|2|3]}
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
      {rank}
    </div>
  );
};

export const RegionalRanking: React.FC = () => {
  const { city, state } = useGeolocation();

  const { data: ranking, isLoading } = useQuery({
    queryKey: ["regional-ranking", city, state],
    queryFn: () => rankingService.getRegionalRanking(city || undefined, state || undefined),
    staleTime: 60 * 60 * 1000, // 1 hour cache
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  // Ocultar completamente se não houver dados
  if (!ranking || ranking.stores.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-hero-primary/10 to-hero-accent/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Medal className="w-5 h-5 text-hero-primary" />
            Ranking de Supermercados
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {ranking.city && ranking.state 
              ? `${ranking.city}, ${ranking.state}` 
              : "Região não identificada"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {ranking.stores.slice(0, 5).map((store) => (
            <div
              key={store.store_name}
              className={`p-4 flex items-center gap-4 transition-colors ${
                store.rank === 1 ? "bg-green-50 dark:bg-green-950/20" : "hover:bg-muted/50"
              }`}
            >
              <RankBadge rank={store.rank} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold truncate">{store.store_name}</h4>
                  {store.rank === 1 && (
                    <Badge className="bg-green-500 text-white text-xs">
                      Mais barato
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {store.total_products} produtos analisados
                </p>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg">
                  R$ {store.average_price.toFixed(2)}
                </div>
                {store.savings_percentage > 0 && (
                  <div className="flex items-center justify-end text-sm text-green-600 dark:text-green-400">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    {store.savings_percentage}% mais barato
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {ranking.average_savings > 0 && (
          <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 border-t">
            <p className="text-center text-sm">
              💡 Economia média de <span className="font-bold text-green-700 dark:text-green-400">{ranking.average_savings}%</span> 
              {" "}escolhendo a loja certa na sua região
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegionalRanking;
