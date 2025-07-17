import React from "react";
import Navbar from "@/components/Navbar";
import MonthlyReport from "@/components/MonthlyReport";
import ProtectedRoute from "@/components/ProtectedRoute";

const Reports: React.FC = () => {
  return (
    <ProtectedRoute fallbackMessage="Você precisa estar logado para visualizar seus relatórios.">
      <div className="min-h-screen bg-app-gray dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto py-8 px-6">
          <h1 className="text-3xl font-bold mb-6">Relatórios Mensais</h1>
          <p className="text-lg text-gray-600 mb-8">
            Acompanhe seus gastos e economias mês a mês, e veja como suas
            compras inteligentes estão fazendo a diferença.
          </p>

          <MonthlyReport />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Reports;
