// src/components/PriceTableResultCards.tsx

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Store, ComparisonData } from "@/lib/types";

interface PriceTableResultCardsProps {
  products: ComparisonData["products"];
  stores: ComparisonData["stores"];
  totals: { [storeId: string]: number };
  cheapestStoreId: string | undefined;
  optimalTotal: number; // Total se comprar tudo no mais barato
  highestTotal: number; // Total do mercado mais caro
  smartSavings: number; // Economia inteligente: diferença entre comprar no mais barato vs estratégia ótima
  cheapestStoreTotal: number; // Total do mercado com menor valor total
}

const PriceTableResultCards: React.FC<PriceTableResultCardsProps> = ({
  products,
  stores,
  totals,
  cheapestStoreId,
  optimalTotal,
  highestTotal,
  smartSavings,
  cheapestStoreTotal,
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
              <p className="text-2xl font-bold text-app-success">
                {stores.find((s) => s.id === cheapestStoreId)?.name}
              </p>
              <p className="text-muted-foreground">
                Total: R$ {totals[cheapestStoreId].toFixed(2).replace(".", ",")}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Nenhum dado disponível
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            Economia (Comparado ao Mais Caro)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const savings = highestTotal - optimalTotal;
            return (
              <>
                <p className={`text-2xl font-bold ${savings >= 0 ? 'text-app-success' : 'text-app-error'}`}>
                  R$ {Math.abs(savings).toFixed(2).replace(".", ",")}
                </p>
                <p className="text-muted-foreground">
                  {savings >= 0 
                    ? "Economia comparado ao mercado mais caro" 
                    : "Diferença a mais comparado ao mais caro"}
                </p>
              </>
            );
          })()}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            Total Comprando no Melhor Preço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-app-primary">
            R$ {optimalTotal.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-muted-foreground">
            Comprando cada produto onde está mais barato
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Economia máxima possível para sua lista
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-app-primary">{products.length}</p>
          <p className="text-muted-foreground">Itens comparados</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceTableResultCards;
