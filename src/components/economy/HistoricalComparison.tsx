import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts";
import { CalendarDays, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";

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

  // Filtrar dados baseado no período selecionado
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

  // Calcular estatísticas de comparação
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

  // Preparar dados para o gráfico
  const chartData = filteredData.map(item => ({
    ...item,
    efficiency: item.comparisons && item.comparisons > 0 
      ? item.savings / item.comparisons 
      : 0
  }));

  const getYAxisLabel = () => {
    switch (viewType) {
      case "savings": return "Economia (R$)";
      case "comparisons": return "Número de Comparações";
      case "efficiency": return "Economia por Comparação (R$)";
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

  const getColor = () => {
    switch (viewType) {
      case "savings": return "#10B981"; // green
      case "comparisons": return "#3B82F6"; // blue
      case "efficiency": return "#8B5CF6"; // purple
      default: return "#10B981";
    }
  };

  const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'stable' }) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <ArrowUpDown className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold flex items-center justify-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Comparação Histórica
        </h3>
        <p className="text-sm text-muted-foreground">
          Analise a evolução da sua economia ao longo do tempo
        </p>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
          <SelectTrigger className="w-[140px]">
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
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="savings">Economia Total</SelectItem>
            <SelectItem value="comparisons">Comparações</SelectItem>
            <SelectItem value="efficiency">Eficiência</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Estatísticas do Período */}
      {trends && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Crescimento</span>
                <TrendIcon trend={trends.trend} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                trends.savingsGrowth > 0 ? 'text-green-600' : 
                trends.savingsGrowth < 0 ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {trends.savingsGrowth > 0 ? '+' : ''}{trends.savingsGrowth.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">No período selecionado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Média Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                R$ {trends.avgSavings.toFixed(2).replace(".", ",")}
              </div>
              <p className="text-sm text-muted-foreground">Economia média</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Total do Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                R$ {trends.totalSavings.toFixed(2).replace(".", ",")}
              </div>
              <p className="text-sm text-muted-foreground">Economia acumulada</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{getYAxisLabel()} ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ChartContainer
              config={{
                data: {
                  label: getYAxisLabel(),
                  color: getColor(),
                },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="dataGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getColor()} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={getColor()} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="label" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    fontSize={12}
                    tickFormatter={(value) => {
                      if (viewType === "savings" || viewType === "efficiency") {
                        return `R$ ${value.toFixed(0)}`;
                      }
                      return value.toString();
                    }}
                  />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        formatter={(value) => {
                          if (viewType === "savings" || viewType === "efficiency") {
                            return [`R$ ${Number(value).toFixed(2)}`, getYAxisLabel()];
                          }
                          return [value.toString(), getYAxisLabel()];
                        }}
                      />
                    } 
                  />
                  <Area
                    type="monotone"
                    dataKey={getDataKey()}
                    stroke={getColor()}
                    fill="url(#dataGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Destaques do Período */}
      {trends && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-green-700 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                Melhor Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="font-semibold">{trends.maxMonth.label}</div>
                <div className="text-lg font-bold text-green-600">
                  R$ {trends.maxMonth.savings.toFixed(2).replace(".", ",")}
                </div>
                <Badge variant="outline" className="text-xs">
                  {trends.maxMonth.comparisons || 0} comparações
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-orange-700 dark:text-orange-400">
                <TrendingDown className="w-4 h-4" />
                Menor Economia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="font-semibold">{trends.minMonth.label}</div>
                <div className="text-lg font-bold text-orange-600">
                  R$ {trends.minMonth.savings.toFixed(2).replace(".", ",")}
                </div>
                <Badge variant="outline" className="text-xs">
                  {trends.minMonth.comparisons || 0} comparações
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Nenhum dado encontrado para o período selecionado.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Faça mais comparações para visualizar o histórico.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HistoricalComparison;