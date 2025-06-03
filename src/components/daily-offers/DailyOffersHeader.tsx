
import React from "react";
import { TrendingDown, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyOffersHeaderProps {
  city: string | null;
  actualOffersCount: number;
  onRefresh: () => void;
}

const DailyOffersHeader: React.FC<DailyOffersHeaderProps> = ({
  city,
  actualOffersCount,
  onRefresh
}) => {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center mb-4">
        <TrendingDown className="text-app-green mr-3" size={32} />
        <h2 className="text-3xl font-bold text-app-dark">
          🔥 Ofertas do Dia
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="ml-4"
          title="Atualizar ofertas"
        >
          <RefreshCw size={16} />
        </Button>
      </div>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Preços compartilhados pela nossa comunidade hoje em <strong>{city || "Trindade"}, PE</strong>
      </p>
      <div className="flex items-center justify-center mt-3 text-sm text-orange-600">
        <AlertTriangle size={16} className="mr-2" />
        <span>
          Sempre confirme os preços no estabelecimento antes da compra
        </span>
      </div>
      {actualOffersCount > 0 && (
        <div className="mt-3 text-sm text-green-600 font-medium">
          ✨ {actualOffersCount} contribuição(ões) real(is) de usuários hoje!
        </div>
      )}
      {actualOffersCount === 0 && (
        <div className="mt-3 text-sm text-blue-600">
          📝 Seja o primeiro a contribuir com preços hoje!
        </div>
      )}
    </div>
  );
};

export default DailyOffersHeader;
