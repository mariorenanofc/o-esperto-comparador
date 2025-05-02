
import React from "react";
import Navbar from "@/components/Navbar";
import ComparisonForm from "@/components/ComparisonForm";

const Comparison: React.FC = () => {
  return (
    <div className="min-h-screen bg-app-gray">
      <Navbar />
      <div className="container mx-auto py-8 px-6">
        <h1 className="text-3xl font-bold mb-6">Comparação de Preços</h1>
        <p className="text-lg text-gray-600 mb-8">
          Adicione produtos e compare seus preços em diferentes mercados para economizar em suas compras.
        </p>
        
        <ComparisonForm />
      </div>
    </div>
  );
};

export default Comparison;
