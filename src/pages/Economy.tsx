import React, { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { comparisonService } from "@/services/comparisonService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  DollarSign, 
  TrendingUp, 
  PiggyBank, 
  Sparkles, 
  ChartBar, 
  Target,
  Wallet,
  ArrowUpRight,
  Crown
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Area, AreaChart, ComposedChart, Line } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EconomyInsights from "@/components/economy/EconomyInsights";
import HistoricalComparison from "@/components/economy/HistoricalComparison";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

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

// Skeleton para loading
const EconomySkeleton = () => (
  <div className="space-y-8">
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-6">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-10 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-80 w-full" />
      </CardContent>
    </Card>
  </div>
);

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

  const { monthly, totalSavings, avgMonthlySavings, bestMonth, growthPercentage } = useMemo(() => {
    const group = new Map<string, number>();
    let total = 0;

    comparisons.forEach((c) => {
      const date = new Date(c.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const storeIds = Array.from(new Set(c.prices.map((p) => p.store.id)));
      const products = c.comparison_products.map((cp) => cp.product);

      const priceMap: Record<string, Record<string, number>> = {};
      products.forEach((p) => (priceMap[p.id] = {}));
      c.prices.forEach((pd) => {
        if (!priceMap[pd.product.id]) priceMap[pd.product.id] = {} as Record<string, number>;
        priceMap[pd.product.id][pd.store.id] = pd.price;
      });

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

    const avgMonthlySavings = monthly.length > 0 
      ? monthly.reduce((sum, m) => sum + m.savings, 0) / monthly.length 
      : 0;
    
    const bestMonth = monthly.length > 0 
      ? monthly.reduce((best, m) => m.savings > best.savings ? m : best, monthly[0])
      : null;

    // Calcular crescimento
    let growthPercentage = 0;
    if (monthly.length >= 2) {
      const last = monthly[monthly.length - 1].savings;
      const prev = monthly[monthly.length - 2].savings;
      growthPercentage = prev > 0 ? ((last - prev) / prev) * 100 : 0;
    }

    return { monthly, totalSavings: total, avgMonthlySavings, bestMonth, growthPercentage };
  }, [comparisons]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-background to-green-50/30 dark:from-gray-900 dark:via-background dark:to-emerald-950/20">
        <Navbar />
        
        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-green-500/10 to-teal-600/10 dark:from-emerald-600/5 dark:via-green-500/5 dark:to-teal-600/5" />
          <div className="container mx-auto py-12 px-6 relative">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 mb-4"
              >
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Dashboard Premium</span>
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 bg-clip-text text-transparent mb-3">
                Sua Economia Inteligente
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Acompanhe cada centavo economizado com suas comparações e descubra padrões para maximizar suas economias.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="container mx-auto py-8 px-6">
          {!isPro ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="max-w-2xl mx-auto overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">Recurso exclusivo do Plano Pro</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <p className="text-muted-foreground">
                    O Dashboard de Economia está disponível para assinantes Pro. Faça upgrade para
                    desbloquear gráficos avançados, insights personalizados e análises de economia.
                  </p>
                  <Link to="/plans">
                    <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg">
                      <Crown className="w-4 h-4 mr-2" />
                      Fazer upgrade agora
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ) : loading ? (
            <EconomySkeleton />
          ) : (
            <Tabs defaultValue="overview" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto bg-muted/50 p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <ChartBar className="w-4 h-4 mr-2" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="insights" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Insights
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Histórico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                {/* Stats Cards */}
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4"
                >
                  {/* Total Savings */}
                  <motion.div variants={itemVariants}>
                    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-background to-green-500/5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                      <CardContent className="p-6 relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25">
                            <PiggyBank className="w-5 h-5 text-white" />
                          </div>
                          {growthPercentage !== 0 && (
                            <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
                              growthPercentage > 0 
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-red-500/20 text-red-600 dark:text-red-400'
                            }`}>
                              <ArrowUpRight className={`w-3 h-3 ${growthPercentage < 0 ? 'rotate-90' : ''}`} />
                              {Math.abs(growthPercentage).toFixed(1)}%
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Economia Total</p>
                        <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                          R$ {totalSavings.toFixed(2).replace(".", ",")}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Average Monthly */}
                  <motion.div variants={itemVariants}>
                    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-background to-indigo-500/5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                      <CardContent className="p-6 relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                            <Wallet className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Média Mensal</p>
                        <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          R$ {avgMonthlySavings.toFixed(2).replace(".", ",")}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Best Month */}
                  <motion.div variants={itemVariants}>
                    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-background to-orange-500/5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                      <CardContent className="p-6 relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
                            <Target className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Melhor Mês</p>
                        <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                          {bestMonth ? `R$ ${bestMonth.savings.toFixed(0)}` : 'N/A'}
                        </p>
                        {bestMonth && (
                          <p className="text-xs text-muted-foreground mt-1">{bestMonth.label}</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Comparisons Count */}
                  <motion.div variants={itemVariants}>
                    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-background to-pink-500/5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                      <CardContent className="p-6 relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25">
                            <ChartBar className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Comparações</p>
                        <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {comparisons.length}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">realizadas</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>

                {/* Main Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <span className="block">Evolução da Economia</span>
                          <span className="text-sm font-normal text-muted-foreground">Acompanhe sua economia mês a mês</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-8">
                      {monthly.length > 0 ? (
                        <div className="w-full">
                          <ChartContainer
                            config={{ 
                              savings: { label: "Economia (R$)", color: "hsl(var(--primary))" },
                              trend: { label: "Tendência", color: "hsl(160, 60%, 50%)" }
                            }}
                            className="h-80 sm:h-96 w-full"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={monthly} margin={{ top: 20, right: 20, left: 10, bottom: 60 }}>
                                <defs>
                                  <linearGradient id="savingsGradientMain" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                                  </linearGradient>
                                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="hsl(160, 60%, 50%)" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="hsl(160, 60%, 50%)" stopOpacity={0.05} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis 
                                  dataKey="label" 
                                  tickLine={false} 
                                  axisLine={false}
                                  fontSize={12}
                                  angle={-45}
                                  textAnchor="end"
                                  height={60}
                                  className="fill-muted-foreground"
                                />
                                <YAxis 
                                  tickFormatter={(v) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
                                  width={70}
                                  fontSize={11}
                                  tickLine={false}
                                  axisLine={false}
                                  className="fill-muted-foreground"
                                />
                                <ChartTooltip 
                                  content={
                                    <ChartTooltipContent 
                                      formatter={(value) => [`R$ ${(Number(value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Economia']}
                                    />
                                  } 
                                />
                                <Area
                                  type="monotone"
                                  dataKey="savings"
                                  fill="url(#areaGradient)"
                                  stroke="hsl(160, 60%, 50%)"
                                  strokeWidth={2}
                                />
                                <Bar 
                                  dataKey="savings" 
                                  fill="url(#savingsGradientMain)" 
                                  radius={[6, 6, 0, 0]} 
                                  barSize={monthly.length > 6 ? 32 : 48}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="savings"
                                  stroke="hsl(var(--primary))"
                                  strokeWidth={3}
                                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                                  activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                                />
                              </ComposedChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      ) : (
                        <div className="h-80 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                              <ChartBar className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground">Sem dados ainda.</p>
                            <p className="text-sm text-muted-foreground">Salve suas comparações para ver sua economia aqui.</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="insights">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <EconomyInsights
                    totalSavings={totalSavings}
                    monthlyData={monthly}
                    comparisonCount={comparisons.length}
                    avgSavingsPerComparison={comparisons.length > 0 ? totalSavings / comparisons.length : 0}
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="history">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <HistoricalComparison monthlyData={monthly} />
                </motion.div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Economy;