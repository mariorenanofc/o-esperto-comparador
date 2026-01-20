import React from "react";
import Navbar from "@/components/Navbar";
import ContributionSection from "@/components/ContributionSection";
import { HandHeart } from "lucide-react";

const Contribute: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20">
      <Navbar />
      <div className="container mx-auto py-6 md:py-8 px-4 md:px-6">
        {/* Header com gradiente */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white mb-4 shadow-lg">
            <HandHeart className="w-7 h-7" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Contribua com a Comunidade
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Ajude outros usuários compartilhando preços e ofertas que você encontrou nos supermercados.
          </p>
        </div>
        
        <ContributionSection />
      </div>
    </div>
  );
};

export default Contribute;
