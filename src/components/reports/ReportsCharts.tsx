import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MonthlyReportData {
  id: string;
  month: number;
  year: number;
  total_spent: number;
  comparison_count: number;
}

interface ReportsChartsProps {
  reports: MonthlyReportData[];
}

const ReportsCharts: React.FC<ReportsChartsProps> = ({ reports }) => {
  const chartData = useMemo(() => {
    // Ordenar por data (mais antigo primeiro para o gráfico)
    const sorted = [...reports].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    return sorted.map((report) => {
      const monthNames = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
      ];

      // Estimar economia como ~15% do gasto total (baseado em encontrar melhores preços)
      const estimatedSavings = report.total_spent * 0.15;

      return {
        month: `${monthNames[report.month - 1]}/${report.year.toString().slice(-2)}`,
        gastos: Number(report.total_spent.toFixed(2)),
        economia: Number(estimatedSavings.toFixed(2)),
        comparacoes: report.comparison_count,
      };
    });
  }, [reports]);

  // Calcular tendências
  const trends = useMemo(() => {
    if (chartData.length < 2) {
      return { spending: 0, savings: 0, comparisons: 0 };
    }

    const current = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];

    const spendingChange = previous.gastos > 0
      ? ((current.gastos - previous.gastos) / previous.gastos) * 100
      : 0;

    const savingsChange = previous.economia > 0
      ? ((current.economia - previous.economia) / previous.economia) * 100
      : 0;

    const comparisonsChange = previous.comparacoes > 0
      ? ((current.comparacoes - previous.comparacoes) / previous.comparacoes) * 100
      : 0;

    return {
      spending: spendingChange,
      savings: savingsChange,
      comparisons: comparisonsChange,
    };
  }, [chartData]);

  const spendingChartConfig: ChartConfig = {
    gastos: {
      label: "Gastos",
      color: "hsl(var(--chart-1))",
    },
    economia: {
      label: "Economia",
      color: "hsl(var(--chart-2))",
    },
  };

  const comparisonsChartConfig: ChartConfig = {
    comparacoes: {
      label: "Comparações",
      color: "hsl(var(--chart-3))",
    },
  };

  const TrendIndicator = ({ value, inverse = false }: { value: number; inverse?: boolean }) => {
    const isPositive = inverse ? value < 0 : value > 0;
    const isNeutral = Math.abs(value) < 0.5;

    if (isNeutral) {
      return (
        <span className="flex items-center gap-1 text-muted-foreground text-sm">
          <Minus className="h-4 w-4" />
          Estável
        </span>
      );
    }

    if (isPositive) {
      return (
        <span className="flex items-center gap-1 text-primary text-sm">
          <TrendingUp className="h-4 w-4" />
          +{Math.abs(value).toFixed(1)}%
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 text-destructive text-sm">
        <TrendingDown className="h-4 w-4" />
        -{Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  if (reports.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Gráfico de Gastos vs Economia */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-base sm:text-lg">
              Evolução de Gastos e Economia
            </CardTitle>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Economia:</span>
                <TrendIndicator value={trends.savings} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={spendingChartConfig} className="h-64 sm:h-80 w-full">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradientGastos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientEconomia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `R$${value}`}
                className="text-xs"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <span className="font-medium">
                        R$ {Number(value).toFixed(2).replace(".", ",")}
                      </span>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="gastos"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="url(#gradientGastos)"
              />
              <Area
                type="monotone"
                dataKey="economia"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                fill="url(#gradientEconomia)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Comparações por Mês */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-base sm:text-lg">
              Comparações Realizadas por Mês
            </CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Tendência:</span>
              <TrendIndicator value={trends.comparisons} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={comparisonsChartConfig} className="h-48 sm:h-64 w-full">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
                allowDecimals={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => (
                      <span className="font-medium">{value} comparações</span>
                    )}
                  />
                }
              />
              <Bar
                dataKey="comparacoes"
                fill="hsl(var(--chart-3))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Economia Acumulada */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">
              Economia Acumulada ao Longo do Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                economiaAcumulada: {
                  label: "Economia Acumulada",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-48 sm:h-64 w-full"
            >
              <LineChart
                data={chartData.reduce((acc, item, index) => {
                  const previousTotal = index > 0 ? acc[index - 1].economiaAcumulada : 0;
                  acc.push({
                    month: item.month,
                    economiaAcumulada: Number((previousTotal + item.economia).toFixed(2)),
                  });
                  return acc;
                }, [] as { month: string; economiaAcumulada: number }[])}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `R$${value}`}
                  className="text-xs"
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => (
                        <span className="font-medium text-primary">
                          R$ {Number(value).toFixed(2).replace(".", ",")}
                        </span>
                      )}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="economiaAcumulada"
                  stroke="hsl(var(--chart-4))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--chart-4))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "hsl(var(--chart-4))" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsCharts;
