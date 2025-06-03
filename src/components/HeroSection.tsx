
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection: React.FC = () => {
  return (
    <div className="bg-app-gray py-8 sm:py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-8 lg:mb-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-app-dark mb-4 sm:mb-6 text-center lg:text-left">
              Compare preços e economize nas compras
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 text-center lg:text-left px-4 lg:px-0">
              O Esperto Comparador ajuda você a encontrar os melhores preços em diferentes 
              supermercados, economizando tempo e dinheiro em suas compras.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start px-4 lg:px-0">
              <Link to="/comparison">
                <Button className="bg-app-green hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg w-full sm:w-auto">
                  Comparar Agora
                </Button>
              </Link>
              <Link to="/reports">
                <Button variant="outline" className="border-app-blue text-app-blue hover:bg-blue-50 px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg w-full sm:w-auto">
                  Ver Relatórios
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80" 
              alt="Comparação de preços"
              className="rounded-lg shadow-xl w-full max-w-sm sm:max-w-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
