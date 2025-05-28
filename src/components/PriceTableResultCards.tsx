
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Store, ComparisonData } from "@/lib/types";

interface PriceTableResultCardsProps {
  products: ComparisonData["products"];
  stores: ComparisonData["stores"];
  totals: { [storeId: string]: number };
  cheapestStoreId: string | undefined;
  calculateOptimalSavings: () => number;
}

const PriceTableResultCards: React.FC<PriceTableResultCardsProps> = ({
  products,
  stores,
  totals,
  cheapestStoreId,
  calculateOptimalSavings,
}) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Mercado Mais Barato</CardTitle>
        </CardHeader>
        <CardContent>
          {cheapestStoreId ? (
            <div>
              <p className="text-2xl font-bold text-app-green">
                {stores.find((s) => s.id === cheapestStoreId)?.name}
              </p>
              <p className="text-gray-500">
                Total: R$ {totals[cheapestStoreId].toFixed(2)}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">Nenhum dado disponível</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Economia Comprando no Melhor Preço</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-app-green">
            R$ {calculateOptimalSavings().toFixed(2)}
          </p>
          <p className="text-gray-500">
            Comprando cada produto no mercado mais barato
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-app-blue">{products.length}</p>
          <p className="text-gray-500">Itens comparados</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceTableResultCards;
