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
            Economia (Comparado à Média)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const savings = averageTotal - optimalTotal;
            return (
              <>
                <p className={`text-2xl font-bold ${savings >= 0 ? 'text-app-success' : 'text-app-error'}`}>
                  R$ {Math.abs(savings).toFixed(2).replace(".", ",")}
                </p>
                <p className="text-muted-foreground">
                  {savings >= 0 
                    ? "Economia comparado à média dos mercados" 
                    : "Diferença a mais comparado à média"}
                </p>
              </>
            );
          })()}
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
