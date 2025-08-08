
import React from "react";
import { Button } from "@/components/ui/button";
import { EyeOff, Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface LoginOverlayProps {
  totalOffers: number;
  onShowAll: () => void;
}

const LoginOverlay: React.FC<LoginOverlayProps> = ({
  totalOffers,
  onShowAll
}) => {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center shadow-lg max-w-md">
        <EyeOff className="mx-auto mb-3 text-app-blue" size={32} />
        <h3 className="text-lg font-semibold mb-2">
          Veja Todas as Ofertas
        </h3>
        <p className="text-gray-600 mb-4 text-sm">
          Faça login para ver todas as {totalOffers} ofertas do dia
        </p>
        <div className="space-y-2">
          <Link to="/sign-in">
            <Button className="w-full bg-app-green hover:bg-app-green/90 text-white">
              Fazer Login
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onShowAll}
          >
            <Eye size={16} className="mr-2" />
            Dar uma Espiada
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginOverlay;
