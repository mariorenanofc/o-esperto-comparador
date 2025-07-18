// src/components/PriceTableResultCards.tsx

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Store, ComparisonData } from "@/lib/types";

interface PriceTableResultCardsProps {
  products: ComparisonData["products"];
  stores: ComparisonData["stores"];
  totals: { [storeId: string]: number };
  cheapestStoreId: string | undefined;
  optimalTotal: number; // <-- NOVO: Total se comprar tudo no mais barato
  highestTotal: number; // <-- NOVO: Total do mercado mais caro
  averageTotal: number; // <-- NOVO: Média dos totais dos mercados
}

const PriceTableResultCards: React.FC<PriceTableResultCardsProps> = ({
  products,
  stores,
  totals,
  cheapestStoreId,
  optimalTotal, // NOVO
  highestTotal, // NOVO
  averageTotal, // NOVO
}) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
      <Card className="dark:bg-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Mercado Mais Barato</CardTitle>
        </CardHeader>
        <CardContent>
          {cheapestStoreId ? (
            <div>
              <p className="text-2xl font-bold text-app-green">
                {stores.find((s) => s.id === cheapestStoreId)?.name}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Total: R$ {totals[cheapestStoreId].toFixed(2).replace(".", ",")}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum dado disponível
            </p>
          )}
        </CardContent>
      </Card>
      <Card className="dark:bg-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            Economia (Comparado ao Mais Caro)
          </CardTitle>{" "}
          {/* <-- TEXTO ALTERADO */}
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-app-green">
            R$ {(highestTotal - optimalTotal).toFixed(2).replace(".", ",")}{" "}
            {/* Usa highestTotal */}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Comprando cada produto no mercado mais barato
          </p>
        </CardContent>
      </Card>
      {/* --- NOVO CARD: Economia (Média dos Mercados) --- */}
      <Card className="dark:bg-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            Economia (Comparado à Média)
          </CardTitle>{" "}
          {/* <-- NOVO CARD */}
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-app-green">
            R$ {(averageTotal - optimalTotal).toFixed(2).replace(".", ",")}{" "}
            {/* Usa averageTotal */}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Se você comprasse tudo em um mercado com preço médio
          </p>
        </CardContent>
      </Card>
      {/* --- FIM DO NOVO CARD --- */}
      <Card className="dark:bg-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-app-blue">{products.length}</p>
          <p className="text-gray-500 dark:text-gray-400">Itens comparados</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceTableResultCards;
