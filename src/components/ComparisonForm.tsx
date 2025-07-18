import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit } from "lucide-react";
import ProductModal from "./ProductModal";
import PriceTable from "./PriceTable"; // Mantenha o import
import BestPricesByStore from "./BestPricesByStore";
import { ComparisonData, Product, ProductFormData, Store } from "@/lib/types";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { comparisonService } from "@/services/comparisonService";
import { useSubscription } from "@/hooks/useSubscription";
import { getPlanById, canUseFeature } from "@/lib/plans";
import { supabaseAdminService } from "@/services/supabase/adminService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const LOCAL_STORAGE_KEY = "comparisonDataSaved";

const ComparisonForm: React.FC = () => {
  const { user, profile } = useAuth();
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
  const [isProcessingComparison, setIsProcessingComparison] = useState(false);
  const [isSavingComparison, setIsSavingComparison] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(true);

  // Carregar do localStorage ao montar
  useEffect(() => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.date) parsed.date = new Date(parsed.date);
        setComparisonData(parsed);
      } catch (e) {
        console.error("Error loading from localStorage:", e);
      }
    }
  }, []);

  // Salvar no localStorage ao mudar e resetar showResults se a lista de produtos ficar vazia
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(comparisonData));
    if (comparisonData.products.length === 0 && showResults) {
      setShowResults(false);
      setIsEditingMode(true);
    }
  }, [comparisonData, showResults]);

  const handleAddStore = () => {
    const planDetails = getPlanById(currentPlan);

    let maxStores = 0;
    if (!isSignedIn) {
      maxStores = 2;
    } else {
      maxStores =
        planDetails.limitations.maxStoresPerComparison === -1
          ? Infinity
          : planDetails.limitations.maxStoresPerComparison || 0;
    }

    if (!storeName.trim()) {
      toast.error("O nome do mercado não pode estar vazio");
      return;
    }

    if (comparisonData.stores.length >= maxStores) {
      if (!isSignedIn) {
        toast.error("Limite atingido", {
          description: `Você pode adicionar no máximo ${maxStores} mercados. Faça login para mais!`,
          duration: 3000,
        });
      } else {
        toast.error("Limite do plano atingido", {
          description: `Seu plano (${planDetails.name}) permite adicionar no máximo ${maxStores} mercados.`,
          duration: 3000,
          action: {
            label: "Upgrade",
            onClick: () => (window.location.href = "/plans"),
          },
        });
      }
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
    const updatedStores = comparisonData.stores.filter(
      (store) => store.id !== storeId
    );
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
    const planDetails = getPlanById(currentPlan);

    let maxProducts = 0;
    if (!isSignedIn) {
      maxProducts = 4;
    } else {
      maxProducts =
        planDetails.limitations.maxProductsPerComparison === -1
          ? Infinity
          : planDetails.limitations.maxProductsPerComparison || 0;
    }

    if (comparisonData.products.length >= maxProducts) {
      if (!isSignedIn) {
        toast.error("Limite atingido", {
          description: `Você pode adicionar no máximo ${maxProducts} produtos. Faça login para mais!`,
          duration: 3000,
        });
      } else {
        toast.error("Limite do plano atingido", {
          description: `Seu plano (${planDetails.name}) permite adicionar no máximo ${maxProducts} produtos.`,
          duration: 3000,
          action: {
            label: "Upgrade",
            onClick: () => (window.location.href = "/plans"),
          },
        });
      }
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
      const updatedProducts = [...comparisonData.products];
      updatedProducts[editingProductIndex] = newProduct;
      setComparisonData({
        ...comparisonData,
        products: updatedProducts,
      });
      toast.success(`Produto ${newProduct.name} atualizado com sucesso.`);
    } else {
      const planDetails = getPlanById(currentPlan);
      let maxProducts = 0;
      if (!isSignedIn) {
        maxProducts = 4;
      } else {
        maxProducts =
          planDetails.limitations.maxProductsPerComparison === -1
            ? Infinity
            : planDetails.limitations.maxProductsPerComparison || 0;
      }

      if (comparisonData.products.length >= maxProducts) {
        toast.error("Limite do plano atingido", {
          description: `Você pode adicionar no máximo ${maxProducts} produtos.`,
          duration: 3000,
          action: {
            label: "Upgrade",
            onClick: () => (window.location.href = "/plans"),
          },
        });
        return;
      }

      setComparisonData({
        ...comparisonData,
        products: [...comparisonData.products, newProduct],
      });
      toast.success(`Produto ${newProduct.name} adicionado com sucesso.`);
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

  // Função `doComparison` para o botão "Fazer Comparação"
  const doComparison = async () => {
    if (!isSignedIn || !user) {
      toast.error("Login necessário", {
        description: "Você precisa estar logado para fazer comparações.",
        duration: 3000,
      });
      return;
    }

    if (comparisonData.products.length === 0) {
      toast.error("Adicione pelo menos um produto para fazer a comparação.");
      return;
    }

    setIsProcessingComparison(true);
    try {
      const planDetails = getPlanById(currentPlan);
      const currentComparisonsMade = profile?.comparisons_made_this_month || 0;

      if (
        !canUseFeature(
          currentPlan,
          "comparisonsPerMonth",
          currentComparisonsMade
        )
      ) {
        toast.error("Limite de comparações mensais atingido!", {
          description: `Seu plano (${planDetails.name}) permite fazer até ${
            planDetails.limitations.comparisonsPerMonth === -1
              ? "ilimitadas"
              : planDetails.limitations.comparisonsPerMonth
          } comparações por mês. Faça upgrade para mais.`,
          duration: 5000,
          action: {
            label: "Upgrade",
            onClick: () => (window.location.href = "/plans"),
          },
        });
        return;
      }

      await supabaseAdminService.incrementComparisonsMade(user.id);
      toast.success("Comparação realizada com sucesso!");

      setShowResults(true); // Exibe a seção de resultados
      setIsEditingMode(false); // Sai do modo de edição (esconde as entradas)

      // IMPORTANTE: comparisonData NÃO É MAIS LIMPO AQUI. Ele permanece para edição futura.
    } catch (error) {
      console.error("Erro ao fazer comparação:", error);
      toast.error("Ocorreu um erro ao fazer a comparação. Tente novamente.");
    } finally {
      setIsProcessingComparison(false);
    }
  };

  // Função `saveComparisonData` para o botão "Salvar Comparação" (histórico)
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

    setIsSavingComparison(true);
    try {
      const planDetails = getPlanById(currentPlan);
      const savedComps = await comparisonService.getUserComparisons(user.id);

      if (!canUseFeature(currentPlan, "savedComparisons", savedComps.length)) {
        if (
          currentPlan === "free" &&
          planDetails.limitations.savedComparisons === 1
        ) {
          const confirmed = window.confirm(
            "Você já tem uma comparação salva em seu plano Gratuito. Deseja sobrescrever a mais antiga com esta?"
          );
          if (!confirmed) {
            toast.info("Operação de salvar cancelada.");
            return;
          }
          const oldestComparison = savedComps.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          )[0];
          if (oldestComparison) {
            await comparisonService.deleteComparison(oldestComparison.id);
            toast.info("Comparação antiga sobrescrita com sucesso.");
          }
        } else {
          toast.error("Limite de comparações salvas atingido!", {
            description: `Seu plano (${planDetails.name}) permite salvar até ${planDetails.limitations.savedComparisons} comparações. Faça upgrade para salvar mais.`,
            duration: 5000,
            action: {
              label: "Upgrade",
              onClick: () => (window.location.href = "/plans"),
            },
          });
          return;
        }
      }

      const currentDate = new Date();
      const comparisonToSave = {
        ...comparisonData,
        date: currentDate,
        userId: user.id,
      };

      await comparisonService.saveComparison(comparisonToSave);
      toast.success(`Sua comparação de preços foi salva com sucesso!`);
    } catch (error) {
      console.error("Erro ao salvar comparação:", error);
      toast.error("Ocorreu um erro ao salvar a comparação. Tente novamente.");
    } finally {
      setIsSavingComparison(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Seção de Adicionar Mercados e Produtos - Visível apenas em modo de edição */}
      {isEditingMode && (
        <>
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
                className="bg-app-blue hover:bg-blue-700 hover:text-gray-200"
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar Mercado
              </Button>
            </div>

            {comparisonData.stores.length > 0 && (
              <div className="mt-4">
                <h3 className="text-md font-medium mb-2">
                  Mercados Adicionados:
                </h3>
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
              <h2 className="text-xl font-semibold">
                Produtos para Comparação
              </h2>
              <Button
                onClick={handleOpenProductModal}
                className="bg-app-green hover:bg-green-700 hover:text-gray-200"
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
                        <th
                          key={store.id}
                          className="py-2 px-4 border text-left"
                        >
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
                  onClick={doComparison} // Chamada para a função "Fazer Comparação"
                  className="bg-app-green hover:bg-green-700 hover:text-gray-200"
                  disabled={isProcessingComparison} // Usa o novo estado de loading
                >
                  {isProcessingComparison
                    ? "Processando..."
                    : "Fazer Comparação"}
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
        </>
      )}

      {/* Seções de Resultados e Botões de Ação - Visíveis apenas quando showResults é true e não está em modo de edição */}
      {showResults && !isEditingMode && comparisonData.products.length > 0 && (
        <>
          <BestPricesByStore comparisonData={comparisonData} />
          {/* A PriceTable foi movida para DENTRO da div de "Salvar esta Comparação" */}

          <div className="mt-6 p-6 bg-white dark:bg-gray-950 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">
              Salvar esta Comparação
            </h3>
            <PriceTable comparisonData={comparisonData} />{" "}
            {/* <-- MOVIDO AQUI */}
            <Button
              onClick={saveComparisonData}
              className="bg-app-blue hover:bg-blue-700 hover:text-gray-200"
              disabled={
                isSavingComparison ||
                !isSignedIn ||
                comparisonData.products.length === 0
              }
            >
              {isSavingComparison ? "Salvando..." : "Salvar Comparação"}
            </Button>
            {!isSignedIn && (
              <p className="text-sm text-gray-500 mt-2">
                Faça login para salvar suas comparações.
              </p>
            )}
          </div>

          {/* Botões para Editar ou Iniciar Nova Comparação */}
          <div className="mt-6 p-6 bg-white dark:bg-gray-950 rounded-lg shadow flex justify-center space-x-4">
            <Button
              onClick={() => {
                setIsEditingMode(true);
                setShowResults(false);
              }}
              className="bg-yellow-500 hover:bg-yellow-600 hover:text-gray-200"
            >
              <Edit className="mr-2 h-4 w-4" /> Editar Comparação
            </Button>
            <Button
              onClick={() => {
                setComparisonData({ products: [], stores: [] });
                localStorage.removeItem(LOCAL_STORAGE_KEY);
                setShowResults(false);
                setIsEditingMode(true);
              }}
              className="bg-red-500 hover:bg-red-600 hover:text-gray-200"
            >
              <Plus className="mr-2 h-4 w-4" /> Nova Comparação
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ComparisonForm;
