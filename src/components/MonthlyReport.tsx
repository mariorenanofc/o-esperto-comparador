
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonthlyReport as MonthlyReportType } from "@/lib/types";
import PriceTable from "./PriceTable";

// Mock data for demonstration purposes
const mockMonthlyReports: MonthlyReportType[] = [
  {
    month: "Janeiro",
    year: 2025,
    totalSpent: 542.87,
    comparisons: [
      {
        products: [
          {
            id: "product-1",
            name: "Arroz",
            quantity: 5,
            unit: "kg",
            prices: { "store-1": 23.90, "store-2": 24.99 }
          },
          {
            id: "product-2",
            name: "Feijão",
            quantity: 1,
            unit: "kg",
            prices: { "store-1": 8.50, "store-2": 7.99 }
          },
          {
            id: "product-3",
            name: "Óleo",
            quantity: 1,
            unit: "L",
            prices: { "store-1": 5.49, "store-2": 5.99 }
          }
        ],
        stores: [
          { id: "store-1", name: "Mercado Bom Preço" },
          { id: "store-2", name: "Mercado Economia" }
        ],
        date: new Date("2025-01-15")
      }
    ]
  },
  {
    month: "Fevereiro",
    year: 2025,
    totalSpent: 498.32,
    comparisons: [
      {
        products: [
          {
            id: "product-4",
            name: "Café",
            quantity: 2,
            unit: "pct",
            prices: { "store-1": 17.90, "store-3": 16.99 }
          },
          {
            id: "product-5",
            name: "Leite",
            quantity: 12,
            unit: "L",
            prices: { "store-1": 53.88, "store-3": 59.88 }
          }
        ],
        stores: [
          { id: "store-1", name: "Mercado Bom Preço" },
          { id: "store-3", name: "Super Mercado" }
        ],
        date: new Date("2025-02-10")
      }
    ]
  }
];

const MonthlyReport: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<MonthlyReportType | null>(null);
  const [selectedComparison, setSelectedComparison] = useState<number | null>(null);

  // In a real application, you would fetch this data from an API or localStorage
  const reports = mockMonthlyReports;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Relatórios Mensais</h2>

        {selectedReport ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                {selectedReport.month} {selectedReport.year}
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
                  <CardTitle className="text-lg">Total Gasto</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-app-green">
                    R$ {selectedReport.totalSpent.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Comparações Realizadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-app-blue">
                    {selectedReport.comparisons.length}
                  </p>
                </CardContent>
              </Card>
            </div>

            <h3 className="text-lg font-medium mt-8 mb-4">Comparações do Mês</h3>

            {selectedReport.comparisons.map((comparison, index) => (
              <div
                key={index}
                className="border rounded-md p-4 mb-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedComparison(selectedComparison === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      Data: {comparison.date?.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {comparison.products.length} produtos em {comparison.stores.length} mercados
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    {selectedComparison === index ? "Ocultar" : "Ver Detalhes"}
                  </Button>
                </div>

                {selectedComparison === index && (
                  <div className="mt-4">
                    <PriceTable comparisonData={comparison} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card
                key={`${report.month}-${report.year}`}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedReport(report)}
              >
                <CardHeader>
                  <CardTitle>
                    {report.month} {report.year}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-app-green">
                    Total: R$ {report.totalSpent.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {report.comparisons.length} comparação(ões)
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyReport;
