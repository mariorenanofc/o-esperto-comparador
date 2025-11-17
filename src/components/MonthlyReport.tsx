import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { reportsService } from "@/services/reportsService";
import { comparisonService } from "@/services/comparisonService";
import PriceTable from "./PriceTable";
import ReportFilters, { ReportFilters as ReportFiltersType } from "./reports/ReportFilters";
import ReportMetrics from "./reports/ReportMetrics";
import { ComparisonData, Product, Store } from "@/lib/types";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { logger } from "@/lib/logger";

// Definição da estrutura de um produto retornado junto com a comparação
interface ComparisonProductDetails {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
}

// Definição da estrutura de um preço associado a um produto e loja
interface ComparisonPriceDetails {
  price: number;
  product: ComparisonProductDetails;
  store: {
    id: string;
    name: string;
  };
}

// Definição da estrutura completa de uma comparação retornada pelo serviço
interface UserComparison {
  id: string;
  user_id: string;
  title: string | null;
  date: string | null;
  created_at: string; // Confirmado como string do Supabase
  updated_at: string | null;
  comparison_products: Array<{
    id: string;
    product: ComparisonProductDetails;
  }>;
  prices: ComparisonPriceDetails[]; // Array de detalhes de preços
}

// Interface para os dados do relatório mensal (adaptada para UserComparison)
interface MonthlyReportData {
  id: string;
  month: number;
  year: number;
  total_spent: number;
  comparison_count: number;
  comparisons: UserComparison[];
}

const MonthlyReport: React.FC = () => {
  const { user } = useAuth();
  const { handleAsync } = useErrorHandler({ component: 'MonthlyReport' });
  const [reports, setReports] = useState<MonthlyReportData[]>([]);
  const [filteredReports, setFilteredReports] = useState<MonthlyReportData[]>([]);
  const [userComparisons, setUserComparisons] = useState<UserComparison[]>([]);
  const [selectedReport, setSelectedReport] = useState<MonthlyReportData | null>(null);
  const [selectedComparisonIndex, setSelectedComparisonIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFiltersType>({
    period: "all",
    sortBy: "date",
    sortOrder: "desc",
    showEmpty: false,
    minComparisons: 1
  });

  const loadUserData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    
    const result = await handleAsync(
      async () => {
        logger.info('Loading user comparisons and reports', { userId: user.id });
        const comparisons: UserComparison[] = await comparisonService.getUserComparisons(user.id);
        logger.info('User comparisons loaded', { count: comparisons.length });
        return comparisons;
      },
      { action: 'load_user_data' },
      { severity: 'medium', showToast: true }
    );

    if (!result) {
      setLoading(false);
      return;
    }

    const comparisons = result;
    setUserComparisons(comparisons);

    const groupedByMonth = comparisons.reduce(
      (
        acc: Record<string, MonthlyReportData>,
        comparison: UserComparison
      ) => {
        const date = new Date(comparison.created_at);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const key = `${year}-${month}`;

        if (!acc[key]) {
          acc[key] = {
            id: key,
            month,
            year,
            total_spent: 0,
            comparison_count: 0,
            comparisons: [],
          };
        }

        acc[key].comparisons.push(comparison);
        acc[key].comparison_count++;

        let comparisonOptimalSpent = 0;
        const productsInThisComparison =
          comparison.comparison_products?.map((cp) => cp.product) || [];

        productsInThisComparison.forEach((product) => {
          let bestPriceForProduct = Infinity;
          comparison.prices.forEach((priceDetail) => {
            if (
              priceDetail.product.id === product.id &&
              priceDetail.price < bestPriceForProduct
            ) {
              bestPriceForProduct = priceDetail.price;
            }
          });
          if (bestPriceForProduct !== Infinity) {
            comparisonOptimalSpent += bestPriceForProduct * product.quantity;
          }
        });
        acc[key].total_spent += comparisonOptimalSpent;

        return acc;
      },
      {}
    );

    const sortedReports = Object.values(groupedByMonth).sort(
      (a, b) => b.year - a.year || b.month - a.month
    );

    logger.info('Monthly reports generated', { count: sortedReports.length });
    setReports(sortedReports);
    setFilteredReports(sortedReports);
    setLoading(false);
  }, [user, handleAsync]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...reports];

    // Filtro por período
    if (filters.period !== "all") {
      const now = new Date();
      const monthsBack = {
        last3months: 3,
        last6months: 6,
        lastyear: 12
      }[filters.period] || 0;

      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack);

      filtered = filtered.filter(report => {
        const reportDate = new Date(report.year, report.month - 1);
        return reportDate >= cutoffDate;
      });
    }

    // Filtro de comparações mínimas
    if (!filters.showEmpty) {
      filtered = filtered.filter(report => report.comparison_count >= filters.minComparisons);
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (filters.sortBy) {
        case "savings":
          // Calcular economia estimada
          aVal = a.total_spent;
          bVal = b.total_spent;
          break;
        case "spending":
          aVal = a.total_spent;
          bVal = b.total_spent;
          break;
        case "comparisons":
          aVal = a.comparison_count;
          bVal = b.comparison_count;
          break;
        case "date":
        default:
          aVal = new Date(a.year, a.month - 1).getTime();
          bVal = new Date(b.year, b.month - 1).getTime();
          break;
      }

      return filters.sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    setFilteredReports(filtered);
  }, [reports, filters]);

  const getMonthName = (month: number) => {
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    return months[month - 1] || "Mês";
  };

  // Função convertComparisonToDisplayFormat agora completa para uso com PriceTable
  const convertComparisonToDisplayFormat = (
    comparison: UserComparison
  ): ComparisonData => {
    const products: Product[] = [];
    const storesMap = new Map<string, Store>();

    // Primeiro, popular produtos a partir de 'comparison_products' (informações básicas)
    comparison.comparison_products?.forEach((cp) => {
      products.push({
        id: cp.product.id,
        name: cp.product.name,
        quantity: cp.product.quantity,
        unit: cp.product.unit,
        category: cp.product.category || 'outros',
        prices: {}, // Será preenchido abaixo
      });
    });

    // Em seguida, preencher preços e coletar lojas únicas a partir do array 'prices'
    comparison.prices.forEach((priceDetail) => {
      const storeId = priceDetail.store.id;
      if (!storesMap.has(storeId)) {
        storesMap.set(storeId, { id: storeId, name: priceDetail.store.name });
      }

      // Encontrar o produto correspondente em nosso array 'products' e adicionar o preço
      const productToUpdate = products.find(
        (p) => p.id === priceDetail.product.id
      );
      if (productToUpdate) {
        productToUpdate.prices[storeId] = priceDetail.price;
      }
    });

    return {
      products,
      stores: Array.from(storesMap.values()),
      date: new Date(comparison.created_at),
    };
  };

  const handleExport = () => {
    // Implementar exportação de relatórios
    const dataStr = JSON.stringify(filteredReports, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorios-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const calculateTotals = () => {
    return {
      totalReports: filteredReports.length,
      totalComparisons: filteredReports.reduce((sum, r) => sum + r.comparison_count, 0),
      totalSavings: filteredReports.reduce((sum, r) => sum + r.total_spent, 0)
    };
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Carregando relatórios...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p>Faça login para ver seus relatórios.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
        totalReports={totals.totalReports}
        totalComparisons={totals.totalComparisons}
        totalSavings={totals.totalSavings}
      />
      
      <div className="bg-white dark:bg-gray-950 p-4 sm:p-6 rounded-lg shadow">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Relatórios Mensais</h2>

        {selectedReport ? (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-medium">
                Detalhes - {getMonthName(selectedReport.month)} {selectedReport.year}
              </h3>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedReport(null);
                  setSelectedComparisonIndex(null);
                }}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Voltar para Lista
              </Button>
            </div>

            <ReportMetrics
              currentMetrics={{
                month: selectedReport.month,
                year: selectedReport.year,
                totalSpent: selectedReport.total_spent,
                totalSavings: selectedReport.total_spent * 0.15, // Estimativa de economia
                comparisonCount: selectedReport.comparison_count,
                avgSavingsPerComparison: selectedReport.comparison_count > 0 
                  ? (selectedReport.total_spent * 0.15) / selectedReport.comparison_count 
                  : 0,
                topStore: "Supermercado Local", // Dados mockados
                topProduct: "Arroz"
              }}
              previousMetrics={
                reports.find(r => 
                  (r.month === selectedReport.month - 1 && r.year === selectedReport.year) ||
                  (selectedReport.month === 1 && r.month === 12 && r.year === selectedReport.year - 1)
                ) ? {
                  month: selectedReport.month === 1 ? 12 : selectedReport.month - 1,
                  year: selectedReport.month === 1 ? selectedReport.year - 1 : selectedReport.year,
                  totalSpent: 0,
                  totalSavings: 0,
                  comparisonCount: 0,
                  avgSavingsPerComparison: 0,
                  topStore: "",
                  topProduct: ""
                } : undefined
              }
            />

            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 mb-4 sm:mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm sm:text-base lg:text-lg">
                    Comparações Realizadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl sm:text-2xl font-bold text-app-blue">
                    {selectedReport.comparison_count}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm sm:text-base lg:text-lg">
                    Total Gasto (Estimado)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl sm:text-2xl font-bold text-app-green">
                    R$ {selectedReport.total_spent.toFixed(2).replace(".", ",")}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Soma das melhores ofertas encontradas por comparação
                  </p>
                </CardContent>
              </Card>
            </div>

            <h3 className="text-base sm:text-lg font-medium mt-6 sm:mt-8 mb-3 sm:mb-4">
              Comparações do Mês
            </h3>

            {selectedReport.comparisons?.map((comparison, index) => (
              <div
                key={comparison.id}
                className="border rounded-md p-3 sm:p-4 mb-3 sm:mb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() =>
                  setSelectedComparisonIndex(
                    selectedComparisonIndex === index ? null : index
                  )
                }
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex-1">
                    <p className="text-sm sm:text-base font-medium">
                      {comparison.title ||
                        `Comparação ${new Date(
                          comparison.created_at
                        ).toLocaleDateString()}`}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Data:{" "}
                      {new Date(comparison.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {comparison.comparison_products?.length || 0} produtos
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm w-full sm:w-auto">
                    {selectedComparisonIndex === index
                      ? "Ocultar"
                      : "Ver Detalhes"}
                  </Button>
                </div>

                {selectedComparisonIndex === index && (
                  <div className="mt-4">
                    {/* Renderize o PriceTable aqui */}
                    <PriceTable
                      comparisonData={convertComparisonToDisplayFormat(
                        comparison
                      )}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredReports.length === 0 ? (
              <div className="col-span-full text-center p-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhuma comparação encontrada ainda.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Faça sua primeira comparação na página "Comparar Preços" para
                  ver os relatórios aqui.
                </p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <Card
                  key={`${report.month}-${report.year}`}
                  className="cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-800 dark:hover:bg-gray-700"
                  onClick={() => setSelectedReport(report)}
                >
                  <CardHeader>
                    <CardTitle>
                      {getMonthName(report.month)} {report.year}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {report.comparison_count} comparação(ões)
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyReport;