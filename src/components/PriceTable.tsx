
import React from "react";
import { ComparisonData, Store } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PriceTableProps {
  comparisonData: ComparisonData;
}

const PriceTable: React.FC<PriceTableProps> = ({ comparisonData }) => {
  const { products, stores } = comparisonData;

  // Calculate the total cost for each store
  const calculateTotalByStore = () => {
    const totals: { [storeId: string]: number } = {};

    stores.forEach((store) => {
      let storeTotal = 0;
      products.forEach((product) => {
        if (product.prices[store.id]) {
          storeTotal += product.prices[store.id];
        }
      });
      totals[store.id] = storeTotal;
    });

    return totals;
  };

  // Find the best price for each product
  const findBestPriceStore = (productIndex: number) => {
    const product = products[productIndex];
    let bestPrice = Infinity;
    let bestStoreId = null;

    stores.forEach((store) => {
      if (
        product.prices[store.id] && 
        product.prices[store.id] < bestPrice
      ) {
        bestPrice = product.prices[store.id];
        bestStoreId = store.id;
      }
    });

    return bestStoreId;
  };

  // Calculate how much you'd save by buying each product at its best price
  const calculateOptimalSavings = () => {
    let optimalTotal = 0;
    let highestTotal = 0;

    products.forEach((product, index) => {
      const bestStoreId = findBestPriceStore(index);
      if (bestStoreId) {
        optimalTotal += product.prices[bestStoreId];
      }
    });

    // Find highest total among all stores
    const totalsByStore = calculateTotalByStore();
    highestTotal = Math.max(...Object.values(totalsByStore));

    return highestTotal - optimalTotal;
  };

  const totals = calculateTotalByStore();
  const cheapestStoreId = Object.entries(totals).reduce(
    (acc, [storeId, total]) => (total < totals[acc] ? storeId : acc),
    stores[0]?.id
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Resultados da Comparação</h2>

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

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-4 border text-left">Produto</th>
              <th className="py-2 px-4 border text-left">Quantidade</th>
              {stores.map((store) => (
                <th key={store.id} className="py-2 px-4 border text-left">
                  {store.name}
                </th>
              ))}
              <th className="py-2 px-4 border text-left">Melhor Preço</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => {
              const bestStoreId = findBestPriceStore(index);
              const bestStore = stores.find((s) => s.id === bestStoreId);

              return (
                <tr key={product.id}>
                  <td className="py-2 px-4 border">{product.name}</td>
                  <td className="py-2 px-4 border">
                    {product.quantity} {product.unit}
                  </td>
                  {stores.map((store) => {
                    const isLowestPrice = store.id === bestStoreId;
                    return (
                      <td
                        key={store.id}
                        className={`py-2 px-4 border ${
                          isLowestPrice ? "bg-green-50" : ""
                        }`}
                      >
                        {product.prices[store.id] ? (
                          <span className={isLowestPrice ? "font-semibold text-app-green" : ""}>
                            R$ {product.prices[store.id].toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-2 px-4 border bg-green-50 font-medium text-app-green">
                    {bestStore ? bestStore.name : "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100">
              <td
                colSpan={2}
                className="py-2 px-4 border font-semibold text-right"
              >
                Total:
              </td>
              {stores.map((store) => (
                <td
                  key={store.id}
                  className={`py-2 px-4 border font-semibold ${
                    store.id === cheapestStoreId
                      ? "bg-green-100 text-app-green"
                      : ""
                  }`}
                >
                  R$ {totals[store.id].toFixed(2)}
                </td>
              ))}
              <td className="py-2 px-4 border"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default PriceTable;
