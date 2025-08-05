import React from "react";
import Navbar from "@/components/Navbar";
import ComparisonForm from "@/components/ComparisonForm";

const Comparison: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
      <Navbar />
      <div className="container mx-auto py-12 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-6">
            📊 Comparação de Preços ✨
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Adicione produtos e compare seus preços em diferentes mercados para
            economizar em suas compras de forma inteligente.
          </p>
        </div>

        <ComparisonForm />
      </div>
    </div>
  );
};

export default Comparison;
