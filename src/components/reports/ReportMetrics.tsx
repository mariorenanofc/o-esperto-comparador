import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, DollarSign, ShoppingCart, BarChart3 } from "lucide-react";

interface MonthMetrics {
  month: number;
  year: number;
  totalSpent: number;
  totalSavings: number;
  comparisonCount: number;
  avgSavingsPerComparison: number;
  topStore: string;
  topProduct: string;
}

interface ReportMetricsProps {
  currentMetrics: MonthMetrics;
  previousMetrics?: MonthMetrics;
}

const ReportMetrics: React.FC<ReportMetricsProps> = ({
  currentMetrics,
  previousMetrics,
}) => {
  const calculateTrend = (current: number, previous?: number) => {
    if (!previous || previous === 0) return { percentage: 0, direction: 'equal' as const };
    
    const diff = ((current - previous) / previous) * 100;
    if (diff > 5) return { percentage: diff, direction: 'up' as const };
    if (diff < -5) return { percentage: Math.abs(diff), direction: 'down' as const };
    return { percentage: Math.abs(diff), direction: 'equal' as const };
  };

  const savingsTrend = calculateTrend(currentMetrics.totalSavings, previousMetrics?.totalSavings);
  const spendingTrend = calculateTrend(currentMetrics.totalSpent, previousMetrics?.totalSpent);
  const comparisonsTrend = calculateTrend(currentMetrics.comparisonCount, previousMetrics?.comparisonCount);

  const TrendIcon = ({ direction }: { direction: 'up' | 'down' | 'equal' }) => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return months[month - 1] || "Mês";
  };

  const savingsEfficiency = currentMetrics.totalSpent > 0 
    ? (currentMetrics.totalSavings / (currentMetrics.totalSpent + currentMetrics.totalSavings)) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold">
          {getMonthName(currentMetrics.month)} {currentMetrics.year}
        </h3>
        <p className="text-muted-foreground">Análise detalhada do período</p>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                Economia Total
              </span>
              <TrendIcon direction={savingsTrend.direction} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {currentMetrics.totalSavings.toFixed(2).replace(".", ",")}
            </div>
            {previousMetrics && (
              <p className="text-sm text-muted-foreground">
                {savingsTrend.direction === 'up' ? '+' : savingsTrend.direction === 'down' ? '-' : ''}
                {savingsTrend.percentage.toFixed(1)}% vs mês anterior
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-500" />
                Gasto Total
              </span>
              <TrendIcon direction={spendingTrend.direction} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {currentMetrics.totalSpent.toFixed(2).replace(".", ",")}
            </div>
            {previousMetrics && (
              <p className="text-sm text-muted-foreground">
                {spendingTrend.direction === 'up' ? '+' : spendingTrend.direction === 'down' ? '-' : ''}
                {spendingTrend.percentage.toFixed(1)}% vs mês anterior
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                Comparações
              </span>
              <TrendIcon direction={comparisonsTrend.direction} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {currentMetrics.comparisonCount}
            </div>
            {previousMetrics && (
              <p className="text-sm text-muted-foreground">
                {comparisonsTrend.direction === 'up' ? '+' : comparisonsTrend.direction === 'down' ? '-' : ''}
                {comparisonsTrend.percentage.toFixed(1)}% vs mês anterior
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Métricas Secundárias */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Eficiência de Economia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Economia vs Gasto Total</span>
              <span className="font-semibold">{savingsEfficiency.toFixed(1)}%</span>
            </div>
            <Progress value={savingsEfficiency} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Para cada R$ 100 gastos, você economizou R$ {(savingsEfficiency).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Economia por Comparação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-600">
              R$ {currentMetrics.avgSavingsPerComparison.toFixed(2).replace(".", ",")}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Economia média por comparação realizada
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              {currentMetrics.comparisonCount > 0 
                ? `Total: ${currentMetrics.comparisonCount} comparações`
                : "Nenhuma comparação realizada"
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Insights do Período</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <p className="font-medium text-sm">Loja com melhor custo-benefício</p>
                <p className="text-xs text-muted-foreground">Mais escolhida nas comparações</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blue-600">{currentMetrics.topStore}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="font-medium text-sm">Produto mais comparado</p>
                <p className="text-xs text-muted-foreground">Item mais pesquisado</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">{currentMetrics.topProduct}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportMetrics;