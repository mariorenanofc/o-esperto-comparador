import React from "react";
import { ComparisonData, Store, Product } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BestPricesByStoreProps {
  comparisonData: ComparisonData;
}

const BestPricesByStore: React.FC<BestPricesByStoreProps> = ({
  comparisonData,
}) => {
  const { products, stores } = comparisonData;

  // Estrutura para armazenar os itens mais baratos por loja
  type BestPriceItem = {
    product: Product;
    unitPrice: number;
    totalPrice: number; // preço unitário x quantidade
  };

  type StoreWithBestPrices = {
    store: Store;
    items: BestPriceItem[];
    total: number;
  };

  // Função para encontrar os itens mais baratos por loja
  const getBestPricesByStore = (): StoreWithBestPrices[] => {
    // Primeiro, determinar qual loja tem o preço mais baixo para cada produto
    const bestPriceMap: Map<string, { storeId: string; price: number }> =
      new Map();

    products.forEach((product) => {
      let bestPrice = Infinity;
      let bestStoreId = "";

      Object.entries(product.prices).forEach(([storeId, price]) => {
        if (typeof price === "number" && price < bestPrice) {
          bestPrice = price;
          bestStoreId = storeId;
        }
      });

      if (bestStoreId) {
        bestPriceMap.set(product.id, {
          storeId: bestStoreId,
          price: bestPrice,
        });
      }
    });

    // Agora, agrupar os produtos por loja
    const storeItemsMap: Map<string, BestPriceItem[]> = new Map();

    products.forEach((product) => {
      const bestPriceInfo = bestPriceMap.get(product.id);
      if (bestPriceInfo) {
        const { storeId, price } = bestPriceInfo;

        const storeItems = storeItemsMap.get(storeId) || [];
        storeItems.push({
          product,
          unitPrice: price,
          totalPrice: price * product.quantity, // Multiplicar preço pela quantidade
        });

        storeItemsMap.set(storeId, storeItems);
      }
    });

    // Converter o mapa em um array e calcular os totais
    const result: StoreWithBestPrices[] = [];

    stores.forEach((store) => {
      const items = storeItemsMap.get(store.id) || [];
      if (items.length > 0) {
        const total = items.reduce((sum, item) => sum + item.totalPrice, 0); // Usar totalPrice

        result.push({
          store,
          items,
          total,
        });
      }
    });

    // Ordenar por número de itens (decrescente)
    return result.sort((a, b) => b.items.length - a.items.length);
  };

  const storesWithBestPrices = getBestPricesByStore();

  return (
    <div className="bg-white dark:bg-gray-950 p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">
        Itens Mais Baratos por Mercado
      </h2>

      {storesWithBestPrices.length === 0 ? (
        <p className="text-gray-500">Nenhum dado disponível para comparação.</p>
      ) : (
        <div className="space-y-8">
          {storesWithBestPrices.map(({ store, items, total }) => (
            <Card key={store.id} className={items.length > 0 ? "" : "hidden"}>
              <CardHeader className="pb-2 bg-gray-50 dark:bg-gray-950">
                <CardTitle className="flex justify-between items-center">
                  <span>{store.name}</span>
                  <span className="text-app-green">
                    {items.length} {items.length === 1 ? "item" : "itens"} mais
                    barato{items.length === 1 ? "" : "s"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Preço Unitário</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(({ product, unitPrice, totalPrice }) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          {product.quantity} {product.unit}
                        </TableCell>
                        <TableCell className="text-app-green font-medium">
                          R$ {unitPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-app-green font-medium">
                          R$ {totalPrice.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-gray-50 dark:bg-gray-950">
                      <TableCell colSpan={3} className="font-bold text-right">
                        Total Geral:
                      </TableCell>
                      <TableCell className="font-bold text-app-green">
                        R$ {total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}

          <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="font-medium">Dica de Economia:</p>
            <p className="text-gray-600">
              Comprando cada produto no mercado onde ele está mais barato, você
              economizará em relação a comprar tudo em um único lugar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BestPricesByStore;
