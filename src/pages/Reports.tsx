
import React from "react";
import Navbar from "@/components/Navbar";
import MonthlyReport from "@/components/MonthlyReport";

const Reports: React.FC = () => {
  return (
    <div className="min-h-screen bg-app-gray">
      <Navbar />
      <div className="container mx-auto py-8 px-6">
        <h1 className="text-3xl font-bold mb-6">Relatórios Mensais</h1>
        <p className="text-lg text-gray-600 mb-8">
          Acompanhe seus gastos e economias mês a mês, e veja como suas compras
          inteligentes estão fazendo a diferença.
        </p>
        
        <MonthlyReport />
      </div>
    </div>
  );
};

export default Reports;
