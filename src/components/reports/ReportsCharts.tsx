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
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, PieChartIcon } from "lucide-react";

// Definição da estrutura de um produto
interface ComparisonProductDetails {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
}

// Definição da estrutura de um preço
interface ComparisonPriceDetails {
  price: number;
  product: ComparisonProductDetails;
  store: {
    id: string;
    name: string;
  };
}

// Definição da estrutura completa de uma comparação
interface UserComparison {
  id: string;
  user_id: string;
  title: string | null;
  date: string | null;
  created_at: string;
  updated_at: string | null;
  comparison_products: Array<{
    id: string;
    product: ComparisonProductDetails;
  }>;
  prices: ComparisonPriceDetails[];
}

interface MonthlyReportData {
  id: string;
  month: number;
  year: number;
  total_spent: number;
  comparison_count: number;
  comparisons: UserComparison[];
}

interface ReportsChartsProps {
  reports: MonthlyReportData[];
}

// Mapeamento de categorias para labels em português
const categoryLabels: Record<string, string> = {
  alimentos: "Alimentos",
  bebidas: "Bebidas",
  laticinios: "Laticínios",
  carnes: "Carnes",
  frutas: "Frutas",
  verduras: "Verduras",
  higiene: "Higiene",
  limpeza: "Limpeza",
  padaria: "Padaria",
  congelados: "Congelados",
  outros: "Outros",
};

// Cores para o gráfico de pizza (usando chart tokens)
const CATEGORY_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(221 83% 53%)",
  "hsl(262 83% 58%)",
  "hsl(316 70% 50%)",
  "hsl(47 80% 52%)",
  "hsl(173 58% 39%)",
];

const ReportsCharts: React.FC<ReportsChartsProps> = ({ reports }) => {
  const chartData = useMemo(() => {
    const sorted = [...reports].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    return sorted.map((report) => {
      const monthNames = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
      ];

      const estimatedSavings = report.total_spent * 0.15;

      return {
        month: `${monthNames[report.month - 1]}/${report.year.toString().slice(-2)}`,
        gastos: Number(report.total_spent.toFixed(2)),
        economia: Number(estimatedSavings.toFixed(2)),
        comparacoes: report.comparison_count,
      };
    });
  }, [reports]);

  // Calcular gastos por categoria
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    reports.forEach((report) => {
      report.comparisons?.forEach((comparison) => {
        comparison.prices?.forEach((priceDetail) => {
          const category = priceDetail.product.category || "outros";
          const quantity = priceDetail.product.quantity || 1;
          const total = priceDetail.price * quantity;

          if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
          }
          categoryTotals[category] += total;
        });
      });
    });

    // Converter para array e ordenar por valor
    const data = Object.entries(categoryTotals)
      .map(([category, value]) => ({
        category,
        label: categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1),
        value: Number(value.toFixed(2)),
      }))
      .sort((a, b) => b.value - a.value);

    // Calcular porcentagens
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return data.map((item) => ({
      ...item,
      percentage: total > 0 ? Number(((item.value / total) * 100).toFixed(1)) : 0,
    }));
  }, [reports]);

  // Configuração do gráfico de pizza
  const categoryChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    categoryData.forEach((item, index) => {
      config[item.category] = {
        label: item.label,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      };
    });
    return config;
  }, [categoryData]);

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
      {/* Grid para Gráfico de Pizza e Comparações */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Gráfico de Pizza - Distribuição por Categoria */}
        {categoryData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                <CardTitle className="text-base sm:text-lg">
                  Gastos por Categoria
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={categoryChartConfig} className="h-64 sm:h-72 w-full">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={2}
                    label={({ label, percentage }) => `${percentage}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        className="stroke-background"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
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
                </PieChart>
              </ChartContainer>
              
              {/* Legenda personalizada */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {categoryData.slice(0, 6).map((item, index) => (
                  <div key={item.category} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                    />
                    <span className="text-muted-foreground truncate">{item.label}</span>
                    <span className="font-medium ml-auto">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gráfico de Comparações por Mês */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="text-base sm:text-lg">
                Comparações por Mês
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
      </div>

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
