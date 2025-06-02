
import React from "react";
import { AlertTriangle } from "lucide-react";

const PriceContributionWarning: React.FC = () => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
        <div className="text-sm text-yellow-800">
          <p className="font-medium mb-2">Aviso Importante:</p>
          <p>
            A plataforma não se responsabiliza pelos preços sugeridos pelos usuários. 
            Os preços compartilhados podem não ser válidos, estar desatualizados ou 
            sofrer alterações. Recomendamos sempre verificar os preços diretamente 
            com o estabelecimento antes de efetuar a compra.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceContributionWarning;
