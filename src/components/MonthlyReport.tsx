import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { reportsService } from "@/services/reportsService";
import { comparisonService } from "@/services/comparisonService";
import PriceTable from "./PriceTable";
import { ComparisonData, Product, Store } from "@/lib/types"; // Adicione Product e Store

// Definição da estrutura de um produto retornado junto com a comparação
interface ComparisonProductDetails {
  id: string;
  name: string;
  quantity: number;
  unit: string;
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
  const [reports, setReports] = useState<MonthlyReportData[]>([]);
  const [userComparisons, setUserComparisons] = useState<UserComparison[]>([]); // Tipo específico aqui
  const [selectedReport, setSelectedReport] =
    useState<MonthlyReportData | null>(null);
  const [selectedComparisonIndex, setSelectedComparisonIndex] = useState<
    number | null
  >(null); // Renomeado
  const [loading, setLoading] = useState(true);

  // Envolva loadUserData em useCallback para otimização e para ser uma dependência estável do useEffect
  const loadUserData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log("Loading user comparisons and reports...");

      const comparisons: UserComparison[] =
        await comparisonService.getUserComparisons(user.id);
      console.log("User comparisons:", comparisons);
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
              total_spent: 0, // Será calculado abaixo
              comparison_count: 0,
              comparisons: [],
            };
          }

          acc[key].comparisons.push(comparison);
          acc[key].comparison_count++;

          // --- Calcular total_spent para a comparação atual (estimado pela melhor oferta) ---
          let comparisonOptimalSpent = 0;
          const productsInThisComparison =
            comparison.comparison_products?.map((cp) => cp.product) || [];

          productsInThisComparison.forEach((product) => {
            let bestPriceForProduct = Infinity;
            // Encontra o menor preço para este produto em qualquer loja nesta comparação
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
          acc[key].total_spent += comparisonOptimalSpent; // Soma ao total do mês

          return acc;
        },
        {}
      );

      const monthlyReports = Object.values(
        groupedByMonth
      ) as MonthlyReportData[];
      setReports(monthlyReports);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]); // loadUserData agora depende apenas de 'user'

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]); // loadUserData adicionado às dependências

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
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-950 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Relatórios Mensais</h2>

        {selectedReport ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                {getMonthName(selectedReport.month)} {selectedReport.year}
              </h3>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedReport(null);
                  setSelectedComparisonIndex(null); // Renomeado
                }}
              >
                Voltar para Lista
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    Comparações Realizadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-app-blue">
                    {selectedReport.comparison_count}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    Total Gasto (Estimado)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-app-green">
                    R$ {selectedReport.total_spent.toFixed(2).replace(".", ",")}
                  </p>
                  <p className="text-sm text-gray-500">
                    Soma das melhores ofertas encontradas por comparação
                  </p>
                </CardContent>
              </Card>
            </div>

            <h3 className="text-lg font-medium mt-8 mb-4">
              Comparações do Mês
            </h3>

            {selectedReport.comparisons?.map((comparison, index) => (
              <div
                key={comparison.id}
                className="border rounded-md p-4 mb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() =>
                  setSelectedComparisonIndex(
                    selectedComparisonIndex === index ? null : index
                  )
                }
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {comparison.title ||
                        `Comparação ${new Date(
                          comparison.created_at
                        ).toLocaleDateString()}`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Data:{" "}
                      {new Date(comparison.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {comparison.comparison_products?.length || 0} produtos
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reports.length === 0 ? (
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
              reports.map((report) => (
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
