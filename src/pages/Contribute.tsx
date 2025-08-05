import React from "react";
import Navbar from "@/components/Navbar";
import ContributionSection from "@/components/ContributionSection";

const Contribute: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20">
      <Navbar />
      <div className="container mx-auto py-12 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-6">
            🤝 Contribua com a Comunidade ✨
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ajude outros usuários compartilhando preços e ofertas que você encontrou nos supermercados.
          </p>
        </div>
        
        <ContributionSection />
      </div>
    </div>
  );
};

export default Contribute;
