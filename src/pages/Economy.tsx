import React, { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { comparisonService } from "@/services/comparisonService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { DollarSign, TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EconomyInsights from "@/components/economy/EconomyInsights";
import HistoricalComparison from "@/components/economy/HistoricalComparison";

interface ComparisonPriceDetail {
  price: number;
  product: { id: string; quantity: number };
  store: { id: string; name: string };
}

interface UserComparisonItem {
  id: string;
  created_at: string;
  comparison_products: Array<{ product: { id: string; name: string; quantity: number; unit: string } }>
  prices: ComparisonPriceDetail[];
}

type SavingsByMonth = { monthKey: string; label: string; savings: number };

const Economy: React.FC = () => {
  const { user } = useAuth();
  const { currentPlan } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [comparisons, setComparisons] = useState<UserComparisonItem[]>([]);

  const isPro = currentPlan === "pro" || currentPlan === "admin";

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const list = await comparisonService.getUserComparisons(user.id);
        setComparisons(list as unknown as UserComparisonItem[]);
      } catch (e) {
        console.error("Falha ao carregar comparações:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const { monthly, totalSavings } = useMemo(() => {
    const group = new Map<string, number>();
    let total = 0;

    comparisons.forEach((c) => {
      const date = new Date(c.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      // map stores
      const storeIds = Array.from(new Set(c.prices.map((p) => p.store.id)));
      const products = c.comparison_products.map((cp) => cp.product);

      // build price map product->store->price
      const priceMap: Record<string, Record<string, number>> = {};
      products.forEach((p) => (priceMap[p.id] = {}));
      c.prices.forEach((pd) => {
        if (!priceMap[pd.product.id]) priceMap[pd.product.id] = {} as Record<string, number>;
        priceMap[pd.product.id][pd.store.id] = pd.price;
      });

      // compute totals by store
      const totalsByStore: Record<string, number> = {};
      storeIds.forEach((sid) => {
        totalsByStore[sid] = products.reduce((acc, p) => {
          const price = priceMap[p.id]?.[sid];
          return acc + (typeof price === "number" ? price * p.quantity : 0);
        }, 0);
      });

      const highest = Object.values(totalsByStore).length
        ? Math.max(...Object.values(totalsByStore))
        : 0;

      const optimal = products.reduce((acc, p) => {
        const best = Math.min(
          ...storeIds.map((sid) => {
            const price = priceMap[p.id]?.[sid];
            return typeof price === "number" ? price : Infinity;
          })
        );
        return acc + (best === Infinity ? 0 : best * p.quantity);
      }, 0);

      const saving = Math.max(0, highest - optimal);
      total += saving;
      group.set(key, (group.get(key) || 0) + saving);
    });

    const monthly: SavingsByMonth[] = Array.from(group.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([k, v]) => {
        const [year, m] = k.split("-");
        const monthNames = [
          "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
          "Jul", "Ago", "Set", "Out", "Nov", "Dez",
        ];
        return { monthKey: k, label: `${monthNames[parseInt(m) - 1]}/${year.slice(-2)}`, savings: Number(v.toFixed(2)) };
      });

    return { monthly, totalSavings: total };
  }, [comparisons]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20">
        <Navbar />
        <div className="container mx-auto py-10 px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
              Dashboard de Economia
            </h1>
            <p className="text-muted-foreground mt-2">Acompanhe a economia estimada obtida com suas comparações.</p>
          </div>

          {!isPro ? (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Recurso exclusivo do Plano Pro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>
                  O Dashboard de Economia está disponível para assinantes Pro. Faça upgrade para
                  desbloquear gráficos e análises avançadas de economia.
                </p>
                <Link to="/plans">
                  <Button className="bg-app-primary hover:bg-app-primary/90 text-white">Fazer upgrade</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-app-green" /> Economia Total Estimada
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold">R$ {totalSavings.toFixed(2).replace(".", ",")}</div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Soma da economia calculada em todas as comparações salvas.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-app-secondary" /> Tendência Mensal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-6">
                    <div className="w-full overflow-x-auto">
                      <ChartContainer
                        config={{ savings: { label: "Economia (R$)", color: "hsl(var(--primary))" } }}
                        className="h-48 sm:h-64 min-w-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthly} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <defs>
                              <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-savings)" stopOpacity={0.9} />
                                <stop offset="95%" stopColor="var(--color-savings)" stopOpacity={0.2} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="label" 
                              tickLine={false} 
                              axisLine={false}
                              fontSize={12}
                              interval={0}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis 
                              tickFormatter={(v) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
                              width={50}
                              fontSize={10}
                            />
                            <ChartTooltip content={<ChartTooltipContent formatter={(value) => [`R$ ${(Number(value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Economia']}/>} />
                            <Bar dataKey="savings" fill="url(#savingsGradient)" radius={[4, 4, 0, 0]} barSize={24} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

                {monthly.length === 0 && !loading && (
                  <p className="text-center text-muted-foreground text-sm">Sem dados ainda. Salve suas comparações para ver sua economia aqui.</p>
                )}
              </TabsContent>

              <TabsContent value="insights">
                <EconomyInsights
                  totalSavings={totalSavings}
                  monthlyData={monthly}
                  comparisonCount={comparisons.length}
                  avgSavingsPerComparison={comparisons.length > 0 ? totalSavings / comparisons.length : 0}
                />
              </TabsContent>

              <TabsContent value="history">
                <HistoricalComparison monthlyData={monthly} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Economy;
