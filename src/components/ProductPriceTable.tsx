import React from "react";
import { Store, Product } from "@/lib/types";

interface ProductPriceTableProps {
  products: Product[];
  stores: Store[];
  totals: { [storeId: string]: number };
  cheapestStoreId?: string;
  findBestPriceStore: (productIndex: number) => string | null;
}

const ProductPriceTable: React.FC<ProductPriceTableProps> = ({
  products,
  stores,
  totals,
  cheapestStoreId,
  findBestPriceStore,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-950">
            <th className="py-2 px-4 border text-left">Produto</th>
            <th className="py-2 px-4 border text-left">Quantidade</th>
            {stores.map((store) => (
              <th key={store.id} className="py-2 px-4 border text-left ">
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
                <td className="py-2 px-4 border ">{product.name}</td>
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
                      } dark:bg-gray-950`}
                    >
                      {product.prices[store.id] ? (
                        <span
                          className={
                            isLowestPrice ? "font-semibold text-app-green" : ""
                          }
                        >
                          R${" "}
                          {(
                            product.prices[store.id] * product.quantity
                          ).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  );
                })}
                <td className="py-2 px-4 border dark:bg-gray-950 bg-green-50 font-medium text-app-green">
                  {bestStore ? bestStore.name : "N/A"}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 dark:bg-gray-950">
            <td
              colSpan={2}
              className="py-2 px-4 border font-semibold text-right dark:bg-gray-950"
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
                } dark:bg-gray-950`}
              >
                R$ {totals[store.id].toFixed(2)}
              </td>
            ))}
            <td className="py-2 px-4 border dark:bg-gray-950"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default ProductPriceTable;
