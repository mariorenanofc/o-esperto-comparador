import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { reportsService } from "@/services/reportsService";
import { comparisonService } from "@/services/comparisonService";
import PriceTable from "./PriceTable";
import { ComparisonData } from "@/lib/types";

interface MonthlyReportData {
  id: string;
  month: number;
  year: number;
  total_spent: number;
  comparison_count: number;
  comparisons: any[];
}

const MonthlyReport: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<MonthlyReportData[]>([]);
  const [userComparisons, setUserComparisons] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] =
    useState<MonthlyReportData | null>(null);
  const [selectedComparison, setSelectedComparison] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log("Loading user comparisons and reports...");

      // Carregar comparações do usuário
      const comparisons = await comparisonService.getUserComparisons(user.id);
      console.log("User comparisons:", comparisons);
      setUserComparisons(comparisons);

      // Agrupar comparações por mês/ano
      const groupedByMonth = comparisons.reduce((acc: any, comparison: any) => {
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

        return acc;
      }, {});

      const monthlyReports = Object.values(
        groupedByMonth
      ) as MonthlyReportData[];
      setReports(monthlyReports);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const convertComparisonToDisplayFormat = (
    comparison: any
  ): ComparisonData => {
    // Converter dados do Supabase para formato esperado pelo PriceTable
    const products =
      comparison.comparison_products?.map((cp: any) => ({
        id: cp.product.id,
        name: cp.product.name,
        quantity: cp.product.quantity,
        unit: cp.product.unit,
        prices: {}, // Será preenchido pelos preços
      })) || [];

    // Agrupar lojas únicas
    const storesMap = new Map();

    // Processar preços e lojas
    comparison.comparison_products?.forEach((cp: any) => {
      // Buscar preços deste produto
      // Nota: seria melhor ter uma estrutura mais normalizada, mas vamos trabalhar com o que temos
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
      <div className="bg-white dark:bg-gray-950  p-6 rounded-lg shadow">
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
                  setSelectedComparison(null);
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
            </div>

            <h3 className="text-lg font-medium mt-8 mb-4">
              Comparações do Mês
            </h3>

            {selectedReport.comparisons?.map((comparison, index) => (
              <div
                key={comparison.id}
                className="border rounded-md p-4 mb-4 cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  setSelectedComparison(
                    selectedComparison === index ? null : index
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
                    <p className="text-sm text-gray-600">
                      Data:{" "}
                      {new Date(comparison.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {comparison.comparison_products?.length || 0} produtos
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    {selectedComparison === index ? "Ocultar" : "Ver Detalhes"}
                  </Button>
                </div>

                {selectedComparison === index && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">
                      Detalhes da comparação:
                    </div>
                    {comparison.comparison_products?.map((cp: any) => (
                      <div key={cp.id} className="text-sm mb-1">
                        • {cp.product?.name} - {cp.product?.quantity}{" "}
                        {cp.product?.unit}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reports.length === 0 ? (
              <div className="col-span-full text-center p-8">
                <p className="text-gray-500">
                  Nenhuma comparação encontrada ainda.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Faça sua primeira comparação na página "Comparar Preços" para
                  ver os relatórios aqui.
                </p>
              </div>
            ) : (
              reports.map((report) => (
                <Card
                  key={`${report.month}-${report.year}`}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedReport(report)}
                >
                  <CardHeader>
                    <CardTitle>
                      {getMonthName(report.month)} {report.year}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
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
