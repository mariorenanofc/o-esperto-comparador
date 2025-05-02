
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection: React.FC = () => {
  return (
    <div className="bg-app-gray py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-app-dark mb-6">
              Compare preços e economize nas compras
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              O Esperto Comparador ajuda você a encontrar os melhores preços em diferentes 
              supermercados, economizando tempo e dinheiro em suas compras.
            </p>
            <div className="flex space-x-4">
              <Link to="/comparison">
                <Button className="bg-app-green hover:bg-green-600 text-white px-6 py-3 text-lg">
                  Comparar Agora
                </Button>
              </Link>
              <Link to="/reports">
                <Button variant="outline" className="border-app-blue text-app-blue hover:bg-blue-50 px-6 py-3 text-lg">
                  Ver Relatórios
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80" 
              alt="Comparação de preços"
              className="rounded-lg shadow-xl w-full max-w-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
