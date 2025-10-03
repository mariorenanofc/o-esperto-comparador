import React from "react";
import Navbar from "@/components/Navbar";
import ComparisonForm from "@/components/ComparisonForm";

const Comparison: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 dark:from-background dark:via-muted/10 dark:to-accent/5">
      <Navbar />
      <div className="container mx-auto py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-app-primary via-app-secondary to-app-success bg-clip-text text-transparent mb-3 sm:mb-4 md:mb-6">
            📊 Comparação de Preços ✨
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
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
