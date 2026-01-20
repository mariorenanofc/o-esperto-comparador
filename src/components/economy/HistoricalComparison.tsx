import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts";
import { motion } from "framer-motion";
import { 
  CalendarDays, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown,
  Sparkles,
  BarChart3,
  Target,
  Wallet
} from "lucide-react";

interface MonthlyData {
  monthKey: string;
  label: string;
  savings: number;
  comparisons?: number;
  avgSavingsPerComparison?: number;
}

interface HistoricalComparisonProps {
  monthlyData: MonthlyData[];
}

const HistoricalComparison: React.FC<HistoricalComparisonProps> = ({
  monthlyData,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<"3months" | "6months" | "1year" | "all">("6months");
  const [viewType, setViewType] = useState<"savings" | "comparisons" | "efficiency">("savings");

  const getFilteredData = () => {
    if (selectedPeriod === "all") return monthlyData;
    
    const monthsToShow = {
      "3months": 3,
      "6months": 6,
      "1year": 12,
    }[selectedPeriod];

    return monthlyData.slice(-monthsToShow);
  };

  const filteredData = getFilteredData();

  const calculateTrends = () => {
    if (filteredData.length < 2) return null;

    const first = filteredData[0];
    const last = filteredData[filteredData.length - 1];
    
    const savingsGrowth = first.savings > 0 
      ? ((last.savings - first.savings) / first.savings) * 100 
      : 0;

    const avgSavings = filteredData.reduce((sum, item) => sum + item.savings, 0) / filteredData.length;
    const totalSavings = filteredData.reduce((sum, item) => sum + item.savings, 0);
    
    const maxMonth = filteredData.reduce((max, item) => 
      item.savings > max.savings ? item : max, filteredData[0]);
    
    const minMonth = filteredData.reduce((min, item) => 
      item.savings < min.savings ? item : min, filteredData[0]);

    return {
      savingsGrowth,
      avgSavings,
      totalSavings,
      maxMonth,
      minMonth,
      trend: (savingsGrowth > 5 ? 'up' : savingsGrowth < -5 ? 'down' : 'stable') as 'up' | 'down' | 'stable'
    };
  };

  const trends = calculateTrends();

  const chartData = filteredData.map(item => ({
    ...item,
    efficiency: item.comparisons && item.comparisons > 0 
      ? item.savings / item.comparisons 
      : 0
  }));

  const getYAxisLabel = () => {
    switch (viewType) {
      case "savings": return "Economia (R$)";
      case "comparisons": return "Comparações";
      case "efficiency": return "Economia/Comparação";
      default: return "";
    }
  };

  const getDataKey = () => {
    switch (viewType) {
      case "savings": return "savings";
      case "comparisons": return "comparisons";
      case "efficiency": return "efficiency";
      default: return "savings";
    }
  };

  const getColorScheme = () => {
    switch (viewType) {
      case "savings": return { main: "hsl(160, 60%, 45%)", light: "hsl(160, 60%, 45%)" };
      case "comparisons": return { main: "hsl(220, 70%, 50%)", light: "hsl(220, 70%, 50%)" };
      case "efficiency": return { main: "hsl(270, 60%, 55%)", light: "hsl(270, 60%, 55%)" };
      default: return { main: "hsl(160, 60%, 45%)", light: "hsl(160, 60%, 45%)" };
    }
  };

  const colors = getColorScheme();

  const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'stable' }) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'down': return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <ArrowUpDown className="w-5 h-5 text-muted-foreground" />;
    }
  };

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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 mb-4">
          <CalendarDays className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Análise Temporal</span>
        </div>
        <h3 className="text-2xl font-bold mb-2">Histórico de Economia</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Analise a evolução da sua economia ao longo do tempo
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-3 justify-center">
        <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">3 meses</SelectItem>
            <SelectItem value="6months">6 meses</SelectItem>
            <SelectItem value="1year">1 ano</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={viewType} onValueChange={(value: any) => setViewType(value)}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="savings">Economia Total</SelectItem>
            <SelectItem value="comparisons">Comparações</SelectItem>
            <SelectItem value="efficiency">Eficiência</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Stats Cards */}
      {trends && (
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
          <Card className="overflow-hidden group hover:shadow-xl transition-all border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-background to-green-500/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                  <TrendIcon trend={trends.trend} />
                </div>
                <Badge variant="outline" className={`text-xs ${
                  trends.savingsGrowth > 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' :
                  trends.savingsGrowth < 0 ? 'bg-red-500/10 text-red-600 border-red-500/30' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {trends.savingsGrowth > 0 ? '+' : ''}{trends.savingsGrowth.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Crescimento</p>
              <p className={`text-2xl font-bold ${
                trends.savingsGrowth > 0 ? 'text-emerald-600 dark:text-emerald-400' : 
                trends.savingsGrowth < 0 ? 'text-red-600 dark:text-red-400' : 
                'text-muted-foreground'
              }`}>
                {trends.savingsGrowth > 0 ? '+' : ''}{trends.savingsGrowth.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden group hover:shadow-xl transition-all border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-background to-indigo-500/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Média Mensal</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                R$ {trends.avgSavings.toFixed(2).replace(".", ",")}
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden group hover:shadow-xl transition-all border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-background to-pink-500/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total do Período</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                R$ {trends.totalSavings.toFixed(2).replace(".", ",")}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Chart */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="block">{getYAxisLabel()} ao Longo do Tempo</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {filteredData.length} {filteredData.length === 1 ? 'mês' : 'meses'} de dados
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            {filteredData.length > 0 ? (
              <div className="h-80 sm:h-96 w-full">
                <ChartContainer
                  config={{
                    data: {
                      label: getYAxisLabel(),
                      color: colors.main,
                    },
                  }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 60 }}>
                      <defs>
                        <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={colors.main} stopOpacity={0.4} />
                          <stop offset="50%" stopColor={colors.main} stopOpacity={0.15} />
                          <stop offset="100%" stopColor={colors.main} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis 
                        dataKey="label" 
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tickLine={false}
                        axisLine={false}
                        className="fill-muted-foreground"
                      />
                      <YAxis 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        className="fill-muted-foreground"
                        tickFormatter={(value) => {
                          if (viewType === "savings" || viewType === "efficiency") {
                            return `R$ ${value.toFixed(0)}`;
                          }
                          return value.toString();
                        }}
                        width={65}
                      />
                      {trends && (
                        <ReferenceLine 
                          y={trends.avgSavings} 
                          stroke={colors.main}
                          strokeDasharray="5 5"
                          strokeOpacity={0.6}
                        />
                      )}
                      <ChartTooltip 
                        content={
                          <ChartTooltipContent 
                            formatter={(value) => {
                              if (viewType === "savings" || viewType === "efficiency") {
                                return [`R$ ${Number(value).toFixed(2).replace(".", ",")}`, getYAxisLabel()];
                              }
                              return [value.toString(), getYAxisLabel()];
                            }}
                          />
                        } 
                      />
                      <Area
                        type="monotone"
                        dataKey={getDataKey()}
                        stroke={colors.main}
                        fill="url(#historicalGradient)"
                        strokeWidth={3}
                        dot={{ fill: colors.main, strokeWidth: 2, r: 5, stroke: "hsl(var(--background))" }}
                        activeDot={{ r: 8, fill: colors.main, stroke: "hsl(var(--background))", strokeWidth: 3 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <CalendarDays className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Nenhum dado encontrado</h4>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Faça mais comparações para visualizar o histórico.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Best/Worst Months */}
      {trends && filteredData.length > 1 && (
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2">
          <Card className="overflow-hidden border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-background to-green-500/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-muted-foreground">Melhor Mês</span>
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                      Destaque
                    </Badge>
                  </div>
                  <div className="font-bold text-lg">{trends.maxMonth.label}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    R$ {trends.maxMonth.savings.toFixed(2).replace(".", ",")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-background to-orange-500/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-muted-foreground">Menor Economia</span>
                    <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                      Atenção
                    </Badge>
                  </div>
                  <div className="font-bold text-lg">{trends.minMonth.label}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    R$ {trends.minMonth.savings.toFixed(2).replace(".", ",")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HistoricalComparison;