import React from "react";
import Navbar from "@/components/Navbar";
import MonthlyReport from "@/components/MonthlyReport";
import ProtectedRoute from "@/components/ProtectedRoute";

const Reports: React.FC = () => {
  return (
    <ProtectedRoute fallbackMessage="Você precisa estar logado para visualizar seus relatórios.">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20">
        <Navbar />
        <div className="container mx-auto py-12 px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-6">
              📈 Relatórios Mensais ✨
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Acompanhe seus gastos e economias mês a mês, e veja como suas
              compras inteligentes estão fazendo a diferença no seu orçamento.
            </p>
          </div>

          <MonthlyReport />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Reports;
