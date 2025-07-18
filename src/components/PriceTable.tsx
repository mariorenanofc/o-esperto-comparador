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
      products.forEach((product) => {
        const price = product.prices[store.id];
        if (typeof price === "number") {
          storeTotal += price * product.quantity;
        }
      });
      totals[store.id] = storeTotal;
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

  const highestTotal = Math.max(...Object.values(totals)); // Maior total entre os mercados
  const averageTotal =
    Object.values(totals).reduce((sum, current) => sum + current, 0) /
    Object.values(totals).length; // Média dos totais dos mercados

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
        averageTotal={averageTotal}
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
