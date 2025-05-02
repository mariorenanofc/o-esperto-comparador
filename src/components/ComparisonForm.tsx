
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit } from "lucide-react";
import ProductModal from "./ProductModal";
import PriceTable from "./PriceTable";
import { ComparisonData, Product, ProductFormData, Store } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

const ComparisonForm: React.FC = () => {
  const [comparisonData, setComparisonData] = useState<ComparisonData>({
    products: [],
    stores: [],
  });
  const [storeName, setStoreName] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormData | undefined>(undefined);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);

  const handleAddStore = () => {
    if (!storeName.trim()) {
      toast({
        title: "Erro",
        description: "O nome do mercado não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    const newStore: Store = {
      id: `store-${Date.now()}`,
      name: storeName.trim(),
    };

    setComparisonData({
      ...comparisonData,
      stores: [...comparisonData.stores, newStore],
    });
    setStoreName("");
  };

  const handleRemoveStore = (storeId: string) => {
    // Remove store from stores list
    const updatedStores = comparisonData.stores.filter(
      (store) => store.id !== storeId
    );

    // Remove this store's prices from all products
    const updatedProducts = comparisonData.products.map((product) => {
      const updatedPrices = { ...product.prices };
      delete updatedPrices[storeId];
      return { ...product, prices: updatedPrices };
    });

    setComparisonData({
      ...comparisonData,
      stores: updatedStores,
      products: updatedProducts,
    });
  };

  const handleOpenProductModal = () => {
    setEditingProduct(undefined);
    setEditingProductIndex(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (index: number) => {
    const product = comparisonData.products[index];
    setEditingProduct({
      name: product.name,
      quantity: product.quantity,
      unit: product.unit,
      prices: { ...product.prices },
    });
    setEditingProductIndex(index);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (productFormData: ProductFormData) => {
    const newProduct: Product = {
      id: editingProductIndex !== null ? comparisonData.products[editingProductIndex].id : `product-${Date.now()}`,
      ...productFormData,
    };

    if (editingProductIndex !== null) {
      // Update existing product
      const updatedProducts = [...comparisonData.products];
      updatedProducts[editingProductIndex] = newProduct;
      setComparisonData({
        ...comparisonData,
        products: updatedProducts,
      });
      toast({
        title: "Produto atualizado",
        description: `${newProduct.name} foi atualizado com sucesso.`,
      });
    } else {
      // Add new product
      setComparisonData({
        ...comparisonData,
        products: [...comparisonData.products, newProduct],
      });
      toast({
        title: "Produto adicionado",
        description: `${newProduct.name} foi adicionado com sucesso.`,
      });
    }
  };

  const handleDeleteProduct = (index: number) => {
    const updatedProducts = [...comparisonData.products];
    const productName = updatedProducts[index].name;
    updatedProducts.splice(index, 1);
    setComparisonData({
      ...comparisonData,
      products: updatedProducts,
    });
    toast({
      title: "Produto removido",
      description: `${productName} foi removido da lista.`,
    });
  };

  const saveComparisonData = () => {
    // Here we could save the data to localStorage, database, etc.
    // For now, let's just show a success toast
    const currentDate = new Date();
    const updatedComparisonData = {
      ...comparisonData,
      date: currentDate,
    };
    
    // In a real app, you would save this data to a database or localStorage
    console.log("Saving comparison data:", updatedComparisonData);
    
    toast({
      title: "Comparação salva",
      description: `Sua comparação de preços foi salva com sucesso.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Adicionar Mercados</h2>
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <Label htmlFor="storeName">Nome do Mercado</Label>
            <Input
              id="storeName"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Ex: Mercado Bom Preço"
            />
          </div>
          <Button
            onClick={handleAddStore}
            className="bg-app-blue hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar Mercado
          </Button>
        </div>

        {comparisonData.stores.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Mercados Adicionados:</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {comparisonData.stores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded border"
                >
                  <span>{store.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveStore(store.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Produtos para Comparação</h2>
          <Button
            onClick={handleOpenProductModal}
            className="bg-app-green hover:bg-green-700"
            disabled={comparisonData.stores.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
          </Button>
        </div>

        {comparisonData.stores.length === 0 && (
          <p className="text-gray-500 italic">
            Adicione pelo menos um mercado antes de cadastrar produtos.
          </p>
        )}

        {comparisonData.products.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-2 px-4 border text-left">Produto</th>
                  <th className="py-2 px-4 border text-left">Quantidade</th>
                  <th className="py-2 px-4 border text-left">Unidade</th>
                  {comparisonData.stores.map((store) => (
                    <th key={store.id} className="py-2 px-4 border text-left">
                      {store.name}
                    </th>
                  ))}
                  <th className="py-2 px-4 border text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.products.map((product, index) => (
                  <tr key={product.id}>
                    <td className="py-2 px-4 border">{product.name}</td>
                    <td className="py-2 px-4 border">{product.quantity}</td>
                    <td className="py-2 px-4 border">{product.unit}</td>
                    {comparisonData.stores.map((store) => (
                      <td key={store.id} className="py-2 px-4 border">
                        {product.prices[store.id] ? (
                          `R$ ${product.prices[store.id].toFixed(2)}`
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    ))}
                    <td className="py-2 px-4 border text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditProduct(index)}
                          className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProduct(index)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {comparisonData.products.length > 0 && (
          <div className="mt-6">
            <Button 
              onClick={saveComparisonData} 
              className="bg-app-green hover:bg-green-700"
            >
              Salvar Comparação
            </Button>
          </div>
        )}

        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSave={handleSaveProduct}
          stores={comparisonData.stores}
          editProduct={editingProduct}
        />
      </div>

      {comparisonData.products.length > 0 && (
        <PriceTable comparisonData={comparisonData} />
      )}
    </div>
  );
};

export default ComparisonForm;
