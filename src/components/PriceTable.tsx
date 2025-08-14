import React from "react";
import { ComparisonData, Store } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import PriceTableResultCards from "./PriceTableResultCards";
import ProductPriceTable from "./ProductPriceTable";

interface PriceTableProps {
  comparisonData: ComparisonData;
}

const PriceTable: React.FC<PriceTableProps> = ({ comparisonData }) => {
  const { products, stores } = comparisonData;

  // Calcular o custo total de cada mercado corretamente multiplicando preço x quantidade (exclui produtos sem preço em cada mercado)
  const calculateTotalByStore = () => {
    const totals: { [storeId: string]: number } = {};

    stores.forEach((store) => {
      let storeTotal = 0;
      let hasValidProducts = false;
      
      products.forEach((product) => {
        const price = product.prices[store.id];
        if (typeof price === "number" && price > 0) {
          storeTotal += price * product.quantity;
          hasValidProducts = true;
        }
      });
      
      // Só inclui o mercado se tiver pelo menos um produto com preço válido
      if (hasValidProducts) {
        totals[store.id] = storeTotal;
      }
    });

    return totals;
  };

  // Encontra o mercado de menor preço para o produto; se não houver preço válido (todos undefined/null) retorna null
  const findBestPriceStore = (productIndex: number): string | null => {
    const product = products[productIndex];
    let bestPrice = Infinity;
    let bestStoreId: string | null = null;

    stores.forEach((store) => {
      const price = product.prices[store.id];
      if (typeof price === "number" && price < bestPrice) {
        bestPrice = price;
        bestStoreId = store.id;
      }
    });

    // Se bestStoreId continuar null, é porque o produto não possui nenhum preço válido!
    return bestStoreId;
  };

  // Função para calcular o total ótimo (comprando cada produto no mercado mais barato)
  const calculateOptimalTotal = (): number => {
    let optimalTotal = 0;
    products.forEach((product) => {
      const bestStoreId = findBestPriceStore(products.indexOf(product));
      if (bestStoreId && typeof product.prices[bestStoreId] === "number") {
        optimalTotal += product.prices[bestStoreId]! * product.quantity;
      }
    });
    return optimalTotal;
  };

  const totals = calculateTotalByStore(); // Totais por mercado
  const optimalTotal = calculateOptimalTotal(); // Total se comprado no mais barato

  const validTotals = Object.values(totals).filter(total => total > 0);
  const highestTotal = validTotals.length > 0 ? Math.max(...validTotals) : 0;
  
  // Calcular economia inteligente: diferença entre comprar tudo no mercado mais barato vs no mercado com menor total
  const cheapestStoreTotal = validTotals.length > 0 ? Math.min(...validTotals) : 0;
  const smartSavings = cheapestStoreTotal - optimalTotal;

  const cheapestStoreId = stores.reduce((acc: string | undefined, store) => {
    if (Object.keys(totals).length === 0) return undefined; // Nenhuma loja com produtos
    if (acc === undefined) return store.id;
    return totals[store.id] < totals[acc] ? store.id : acc;
  }, undefined);

  return (
    <div className="bg-white dark:bg-gray-950 p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Resultados da Comparação</h2>
      <PriceTableResultCards
        products={products}
        stores={stores}
        totals={totals}
        cheapestStoreId={cheapestStoreId}
        optimalTotal={optimalTotal}
        highestTotal={highestTotal}
        smartSavings={smartSavings}
        cheapestStoreTotal={cheapestStoreTotal}
      />
      <ProductPriceTable
        products={products}
        stores={stores}
        totals={totals}
        cheapestStoreId={cheapestStoreId}
        findBestPriceStore={findBestPriceStore}
      />
    </div>
  );
};

export default PriceTable;
