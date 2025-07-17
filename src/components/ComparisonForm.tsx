import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit } from "lucide-react";
import ProductModal from "./ProductModal";
import PriceTable from "./PriceTable";
import BestPricesByStore from "./BestPricesByStore";
import { ComparisonData, Product, ProductFormData, Store } from "@/lib/types";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { getPlanById, canUseFeature } from "@/lib/plans";
import { comparisonService } from "@/services/comparisonService";

const LOCAL_STORAGE_KEY = "comparisonDataSaved";

const ComparisonForm: React.FC = () => {
  const { user } = useAuth();
  const { currentPlan } = useSubscription();
  const isSignedIn = !!user;
  const [comparisonData, setComparisonData] = useState<ComparisonData>({
    products: [],
    stores: [],
  });
  const [storeName, setStoreName] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<
    ProductFormData | undefined
  >(undefined);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  // Carregar do localStorage ao montar
  useEffect(() => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        // Ajustar datas
        if (parsed.date) parsed.date = new Date(parsed.date);
        setComparisonData(parsed);
      } catch (e) {
        console.error("Error loading from localStorage:", e);
      }
    }
  }, []);

  // Salvar no localStorage ao mudar
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(comparisonData));
  }, [comparisonData]);

  const handleAddStore = () => {
    // Limite: 2 para não logado, ilimitado para logado
    if (!isSignedIn && comparisonData.stores.length >= 2) {
      toast.error("Faça login para adicionar mais mercados", {
        description: "Cadastre-se ou entre para poder comparar mais mercados!",
        duration: 3000, // Exemplo de opção do sonner
      });
      return;
    }
    if (!storeName.trim()) {
      toast.error("O nome do mercado não pode estar vazio"); // Ajuste aqui se necessário
      return;
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
    // Limite: 5 produtos para não logado
    if (!isSignedIn && comparisonData.products.length >= 5) {
      toast.error("Faça login para adicionar mais produtos", {
        description:
          "Cadastre-se ou entre para poder adicionar quantos produtos quiser!",
        duration: 3000,
      });
      return;
    }
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
      id:
        editingProductIndex !== null
          ? comparisonData.products[editingProductIndex].id
          : `product-${Date.now()}`,
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
      toast.success("Produto atualizado", {
        description: `${newProduct.name} foi atualizado com sucesso.`,
        duration: 4000,
      });
    } else {
      // Limite reaplicado do lado da modal (caso algo estranho aconteça)
      if (!isSignedIn && comparisonData.products.length >= 5) {
        toast.error("Faça login para adicionar mais produtos", {
          // Ajuste aqui se necessário
          description:
            "Cadastre-se ou entre para poder adicionar quantos produtos quiser!",
          duration: 3000,
        });
        return;
      }
      // Add new product
      setComparisonData({
        ...comparisonData,
        products: [...comparisonData.products, newProduct],
      });
      toast.success(`Produto ${newProduct.name} adicionado com sucesso.`); // Ajuste aqui se necessário
    }
  };

  const handleUpdateExistingProduct = (
    productToUpdate: Product,
    newData: ProductFormData
  ) => {
    const updatedProducts = comparisonData.products.map((product) =>
      product.id === productToUpdate.id ? { ...product, ...newData } : product
    );

    setComparisonData({
      ...comparisonData,
      products: updatedProducts,
    });

    toast.success(`Produto ${newData.name} atualizado com sucesso.`);
  };

  const handleDeleteProduct = (index: number) => {
    const updatedProducts = [...comparisonData.products];
    const productName = updatedProducts[index].name;
    updatedProducts.splice(index, 1);
    setComparisonData({
      ...comparisonData,
      products: updatedProducts,
    });
    toast.success(`Produto ${productName} removido da lista.`);
  };

  const saveComparisonData = async () => {
    if (!isSignedIn || !user) {
      toast.error("Login necessário", {
        description: "Você precisa estar logado para salvar comparações.",
        duration: 3000,
      });
      return;
    }

    if (comparisonData.products.length === 0) {
      toast.error("Adicione pelo menos um produto para salvar a comparação.");
      return;
    }

    setIsSaving(true);
    try {
      // --- VERIFICAÇÃO DE LIMITE DO PLANO ---
      const planDetails = getPlanById(currentPlan); // Obtém detalhes do plano atual
      const userComparisons = await comparisonService.getUserComparisons(
        user.id
      ); // Busca as comparações salvas do usuário

      // Verifica se o usuário pode salvar mais comparações
      if (
        !canUseFeature(currentPlan, "savedComparisons", userComparisons.length)
      ) {
        toast.error("Limite de comparações salvas atingido!", {
          description: `Seu plano (${planDetails.name}) permite salvar até ${
            planDetails.limitations.savedComparisons === -1
              ? "ilimitadas"
              : planDetails.limitations.savedComparisons
          } comparações. Faça upgrade para salvar mais.`,
          duration: 5000,
          action: {
            label: "Upgrade",
            onClick: () => (window.location.href = "/plans"), // Redireciona para a página de planos
          },
        });
        setIsSaving(false);
        return;
      }
      // --- FIM DA VERIFICAÇÃO DE LIMITE ---

      const currentDate = new Date();
      const updatedComparisonData = {
        ...comparisonData,
        date: currentDate,
        userId: user.id,
      };

      console.log("Saving comparison data:", updatedComparisonData);

      // Salvar no Supabase
      const savedComparison = await comparisonService.saveComparison(
        updatedComparisonData
      );

      console.log("Comparison saved:", savedComparison);

      // Limpar localStorage após salvar com sucesso
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      // Resetar formulário
      setComparisonData({
        products: [],
        stores: [],
      });

      toast.success(
        `Sua comparação de preços foi salva com sucesso no banco de dados.`
      );
    } catch (error) {
      console.error("Error saving comparison:", error);
      toast.error("Erro ao salvar", {
        description: "Ocorreu um erro ao salvar a comparação. Tente novamente.",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-950 p-6 rounded-lg shadow">
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
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-950 p-3 rounded border"
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

      <div className="bg-white dark:bg-gray-950 p-6 rounded-lg shadow">
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
                <tr className="bg-gray-50 dark:bg-gray-950">
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
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar Comparação"}
            </Button>
            {!isSignedIn && (
              <p className="text-sm text-gray-500 mt-2">
                * Faça login para salvar suas comparações
              </p>
            )}
          </div>
        )}

        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSave={handleSaveProduct}
          onUpdate={handleUpdateExistingProduct}
          stores={comparisonData.stores}
          editProduct={editingProduct}
          existingProducts={comparisonData.products}
        />
      </div>

      {comparisonData.products.length > 0 && (
        <>
          <BestPricesByStore comparisonData={comparisonData} />
          <PriceTable comparisonData={comparisonData} />
        </>
      )}
    </div>
  );
};

export default ComparisonForm;
