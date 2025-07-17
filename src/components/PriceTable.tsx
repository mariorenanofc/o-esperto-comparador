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

  // Economia máxima comprando cada produto onde está mais barato (ignorar produtos sem preço em todos os mercados)
  const calculateOptimalSavings = () => {
    let optimalTotal = 0;
    let highestTotal = 0;

    // Só considera produtos que têm pelo menos um preço válido
    const productsWithPrice = products.filter((prod, idx) =>
      findBestPriceStore(idx)
    );

    productsWithPrice.forEach((product, index) => {
      // Aqui está correto pois filtered
      const bestStoreId = findBestPriceStore(products.indexOf(product));
      if (bestStoreId) {
        optimalTotal += product.prices[bestStoreId]! * product.quantity;
      }
    });

    // Encontrar o maior total entre todos mercados para mostrar economia possível
    const totalsByStore = calculateTotalByStore();
    highestTotal = Math.max(...Object.values(totalsByStore));

    return highestTotal - optimalTotal;
  };

  const totals = calculateTotalByStore();

  // Filtra somente mercados existentes
  const validStoreIds = stores.map((s) => s.id);
  const cheapestStoreId = validStoreIds.reduce(
    (acc: string | undefined, storeId) => {
      // Desconsidera se não há produtos para o mercado
      if (acc === undefined) return storeId;
      return totals[storeId] < totals[acc] ? storeId : acc;
    },
    undefined
  );

  return (
    <div className="bg-white dark:bg-gray-950 p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Resultados da Comparação</h2>
      <PriceTableResultCards
        products={products}
        stores={stores}
        totals={totals}
        cheapestStoreId={cheapestStoreId}
        calculateOptimalSavings={calculateOptimalSavings}
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
