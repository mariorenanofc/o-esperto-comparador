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
  onRefresh,
}) => {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center mb-4">
        <TrendingDown className="text-app-green mr-3" size={32} aria-hidden="true" />
        <h2 className="text-3xl font-bold text-app-dark dark:text-gray-200">
          <span aria-hidden="true">🔥</span> Ofertas do Dia
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="ml-4"
          aria-label="Atualizar ofertas"
        >
          <RefreshCw size={16} aria-hidden="true" />
        </Button>
      </div>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
        Preços compartilhados pela nossa comunidade hoje em{" "}
        <strong>{city || "Trindade"}, PE</strong>
      </p>
      <div className="flex items-center justify-center mt-3 text-sm text-orange-600" role="alert">
        <AlertTriangle size={16} className="mr-2" aria-hidden="true" />
        <span>
          Sempre confirme os preços no estabelecimento antes da compra
        </span>
      </div>
      {actualOffersCount > 0 && (
        <div className="mt-3 text-sm text-green-600 font-medium" role="status">
          <span aria-hidden="true">✨</span> {actualOffersCount} contribuição(ões) real(is) de usuários hoje!
        </div>
      )}
      {actualOffersCount === 0 && (
        <div className="mt-3 text-sm text-blue-600">
          <span aria-hidden="true">📝</span> Seja o primeiro a contribuir com preços hoje!
        </div>
      )}
    </div>
  );
};

export default DailyOffersHeader;
