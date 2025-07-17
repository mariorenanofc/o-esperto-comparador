import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ContributeCallToAction: React.FC = () => {
  return (
    <div className="text-center mt-12">
      <div className="bg-white/70 dark:bg-gray-950 backdrop-blur-sm rounded-xl p-6 inline-block">
        <p className="text-gray-600 mb-4 dark:text-gray-200">
          Encontrou um preço melhor? Compartilhe com a comunidade!
        </p>
        <Link to="/contribute">
          <Button className="bg-app-blue hover:bg-blue-600">
            Contribuir com Preços
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ContributeCallToAction;
