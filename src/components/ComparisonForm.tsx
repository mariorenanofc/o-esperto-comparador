import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Download, History, TrendingUp } from "lucide-react";
import { ProductSearchSuggestions } from "@/components/ui/product-search-suggestions";
import { ProductSearch } from "@/components/ui/product-search";
import { CategoryFilter } from "@/components/ui/category-filter";
import { useCategories } from "@/hooks/useCategories";
import { useProductFilters, useSearchHistory } from "@/hooks/useProductFilters";
import { useProductSearch } from "@/hooks/useProductSearch";
import ProductModal from "./ProductModal";
import PriceTable from "./PriceTable";
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
import LoadComparisonDrawer from "@/components/comparison/LoadComparisonDrawer";
import { exportComparisonPdf } from "@/lib/pdf/exportComparisonPdf";
import { useGeolocation } from "@/hooks/useGeolocation";
import { ErrorBoundaryWithRetry } from "@/components/ErrorBoundaryWithRetry";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { logger } from "@/lib/logger";

const LOCAL_STORAGE_KEY = "comparisonDataSaved";

// Input validation
const validateStoreName = (name: string): { valid: boolean; error?: string } => {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: "O nome do mercado não pode estar vazio" };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: "Nome do mercado muito curto (mínimo 2 caracteres)" };
  }
  if (trimmed.length > 50) {
    return { valid: false, error: "Nome do mercado muito longo (máximo 50 caracteres)" };
  }
  if (!/^[a-zA-ZÀ-ÿ0-9\s\-&.]+$/.test(trimmed)) {
    return { valid: false, error: "Nome do mercado contém caracteres inválidos" };
  }
  return { valid: true };
};

const ComparisonFormContent: React.FC = () => {
  const { handleAsync, retry } = useErrorHandler({ component: 'ComparisonForm' });
  const [comparisonData, setComparisonData] = useState<ComparisonData>({
    products: [],
    stores: [],
  });
  const { user, profile } = useAuth();
  const { currentPlan } = useSubscription();
  const isSignedIn = !!user;
  const { categories } = useCategories();
  const { searchHistory } = useSearchHistory();
  // Para ComparisonForm, use apenas produtos da comparação atual
  const {
    filters,
    filteredProducts,
    availableCategories,
    setSearch,
    setCategory,
    setSorting,
    clearFilters,
    filterStats
  } = useProductFilters(comparisonData.products);
  // Enhanced search with suggestions
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
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
  const [isLoadDrawerOpen, setIsLoadDrawerOpen] = useState(false);
  const geo = useGeolocation();
  // Carregar do localStorage ao montar
  useEffect(() => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.date) parsed.date = new Date(parsed.date);
        setComparisonData(parsed);
        logger.info('Comparison data loaded from localStorage', { 
          productsCount: parsed.products?.length || 0,
          storesCount: parsed.stores?.length || 0
        });
      } catch (e) {
        logger.error('Error loading comparison from localStorage', e);
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

  // Preencher local automaticamente a partir da geolocalização
  useEffect(() => {
    if (!geo.loading && geo.city && geo.state) {
      setComparisonData((prev) => {
        if (prev.location && prev.location.trim() !== "") return prev;
        return { ...prev, location: `${geo.city}/${geo.state}` };
      });
    }
  }, [geo.loading, geo.city, geo.state]);

  const handleAddStore = () => {
    // Validate input
    const validation = validateStoreName(storeName);
    if (!validation.valid) {
      toast.error(validation.error);
      logger.warn('Invalid store name attempted', { storeName });
      return;
    }

    const planDetails = getPlanById(currentPlan);
    const maxStores = !isSignedIn 
      ? 2 
      : planDetails.limitations.maxStoresPerComparison === -1
        ? Infinity
        : planDetails.limitations.maxStoresPerComparison || 0;

    // Check for duplicates (case-insensitive)
    const storeNameLower = storeName.trim().toLowerCase();
    const existingStore = comparisonData.stores.find(
      store => store.name.toLowerCase() === storeNameLower
    );

    if (existingStore) {
      toast.error("Mercado já adicionado", {
        description: `O mercado "${existingStore.name}" já foi adicionado à comparação.`,
        duration: 3000,
      });
      logger.info('Duplicate store rejected', { storeName: existingStore.name });
      return;
    }

    // Check plan limits
    if (comparisonData.stores.length >= maxStores) {
      const errorMessage = !isSignedIn
        ? `Você pode adicionar no máximo ${maxStores} mercados. Faça login para mais!`
        : `Seu plano (${planDetails.name}) permite adicionar no máximo ${maxStores} mercados.`;
      
      toast.error("Limite atingido", {
        description: errorMessage,
        duration: 3000,
        action: isSignedIn ? {
          label: "Upgrade",
          onClick: () => (window.location.href = "/plans"),
        } : undefined,
      });
      logger.warn('Store limit reached', { currentPlan, maxStores });
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
    toast.success(`Mercado "${newStore.name}" adicionado com sucesso!`);
    logger.info('Store added successfully', { storeName: newStore.name, storeId: newStore.id });
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
      category: product.category || 'outros',
      prices: { ...product.prices },
    });
    setEditingProductIndex(index);
    setIsProductModalOpen(true);
  };

  // Handle adding product from search suggestions
  const handleAddProductFromSearch = (product: Product) => {
    logger.info('Adding product from search', { productName: product.name });
      
    // Check if product already exists
    const existingProduct = comparisonData.products.find(p => 
      p.name.toLowerCase() === product.name.toLowerCase()
    );
    
    if (existingProduct) {
      toast.info("Produto já está na comparação");
      return;
    }

    // Check limits
    const planDetails = getPlanById(currentPlan);
    const maxProducts = planDetails?.limitations?.maxProductsPerComparison || 8;
    if (comparisonData.products.length >= maxProducts) {
      const errorMessage = !isSignedIn
        ? `Você pode adicionar no máximo ${maxProducts} produtos. Faça login para mais!`
        : `Seu plano permite adicionar no máximo ${maxProducts} produtos.`;
      
      toast.error("Limite atingido", {
        description: errorMessage,
        duration: 3000,
        action: isSignedIn ? {
          label: "Upgrade",
          onClick: () => (window.location.href = "/plans"),
        } : undefined,
      });
      return;
    }

    // Add product with empty prices for all stores
    const newProduct: Product = {
      ...product,
      id: `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      prices: {}
    };

    // Initialize prices for existing stores
    comparisonData.stores.forEach(store => {
      newProduct.prices[store.id] = 0;
    });

    setComparisonData({
      ...comparisonData,
      products: [...comparisonData.products, newProduct]
    });

    toast.success(`"${product.name}" adicionado à comparação!`);
    logger.info('Product added successfully', { productId: newProduct.id, productName: newProduct.name });
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
      logger.warn('Comparison attempted without authentication');
      return;
    }

    if (comparisonData.products.length === 0) {
      toast.error("Adicione pelo menos um produto para fazer a comparação.");
      return;
    }

    setIsProcessingComparison(true);
    
    await handleAsync(
      async () => {
        const planDetails = getPlanById(currentPlan);
        const currentComparisonsMade = profile?.comparisons_made_this_month || 0;

        if (!canUseFeature(currentPlan, "comparisonsPerMonth", currentComparisonsMade)) {
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
          logger.warn('Monthly comparison limit reached', { currentPlan, currentComparisonsMade });
          return;
        }

        logger.info('Processing comparison', { 
          productsCount: comparisonData.products.length,
          storesCount: comparisonData.stores.length,
          userId: user.id
        });

        await supabaseAdminService.incrementComparisonsMade(user.id);
        
        setShowResults(true);
        setIsEditingMode(false);
        
        toast.success("Comparação realizada com sucesso!");
        logger.info('Comparison completed successfully', { userId: user.id });
      },
      { component: 'ComparisonForm', action: 'doComparison', userId: user?.id },
      { severity: 'medium' }
    );
    
    setIsProcessingComparison(false);
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
    
    const result = await retry(
      async () => {
        logger.info('Saving comparison', { userId: user.id, productsCount: comparisonData.products.length });
        
        const planDetails = getPlanById(currentPlan);
        const savedComps = await comparisonService.getUserComparisons(user.id);

        if (!canUseFeature(currentPlan, "savedComparisons", savedComps.length)) {
          if (currentPlan === "free" && planDetails.limitations.savedComparisons === 1) {
            const confirmed = window.confirm(
              "Você já tem uma comparação salva em seu plano Gratuito. Deseja sobrescrever a mais antiga com esta?"
            );
            if (!confirmed) {
              toast.info("Operação de salvar cancelada.");
              logger.info('Save comparison cancelled by user');
              return;
            }
            
            const oldestComparison = savedComps.sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )[0];
            
            if (oldestComparison) {
              await comparisonService.deleteComparison(oldestComparison.id);
              logger.info('Oldest comparison deleted', { comparisonId: oldestComparison.id });
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
            logger.warn('Saved comparisons limit reached', { currentPlan, savedCount: savedComps.length });
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
        logger.info('Comparison saved successfully', { userId: user.id });
      },
      2, // max attempts
      3000 // 3s delay
    );
    
    setIsSavingComparison(false);
  };

  const handleExportPdf = async () => {
    if (!isSignedIn) {
      toast.error("Faça login para baixar o PDF.");
      return;
    }
    if (!(currentPlan === "pro" || currentPlan === "admin")) {
      toast.error("Recurso do plano Pro", {
        description: "Exportação em PDF disponível apenas para Pro e Admin.",
        action: { label: "Upgrade", onClick: () => (window.location.href = "/plans") },
      });
      return;
    }
    try {
      await exportComparisonPdf(comparisonData, 
        { city: geo.city, state: geo.state },
        {
          userName: profile?.name,
          userEmail: profile?.email || undefined,
          userPlan: currentPlan,
        }
      );
    } catch (e) {
      console.error(e);
      toast.error("Falha ao gerar o PDF. Tente novamente.");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Seção de Adicionar Mercados e Produtos - Visível apenas em modo de edição */}
      {isEditingMode && (
        <>
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow border">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Adicionar Mercados</h2>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-end gap-2 sm:gap-3">
              <div className="flex-1 w-full sm:min-w-[220px]">
                <Label htmlFor="storeName" className="text-sm sm:text-base">Nome do Mercado</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Ex: Mercado Bom Preço"
                  className="text-sm sm:text-base"
                />
              </div>
              <Button
                onClick={handleAddStore}
                className="bg-app-primary hover:bg-app-primary/90 text-white w-full sm:w-auto text-sm sm:text-base"
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar Mercado
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsLoadDrawerOpen(true)}
                disabled={!isSignedIn}
                className="w-full sm:w-auto text-sm sm:text-base"
                title={!isSignedIn ? "Faça login para carregar comparações salvas" : undefined}
              >
                <History className="mr-2 h-4 w-4" /> Reaproveitar Salvas
              </Button>
            </div>

            {comparisonData.stores.length > 0 && (
              <div className="mt-3 sm:mt-4">
                <h3 className="text-sm sm:text-md font-medium mb-2">
                  Mercados Adicionados:
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {comparisonData.stores.map((store) => (
                    <div
                      key={store.id}
                      className="flex items-center justify-between bg-muted p-3 rounded border"
                    >
                      <span>{store.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveStore(store.id)}
                        className="h-8 w-8 text-app-error hover:text-app-error/80 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-card p-4 sm:p-6 rounded-lg shadow border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">
                Produtos para Comparação
              </h2>
              <Button
                onClick={handleOpenProductModal}
                className="bg-app-secondary hover:bg-app-secondary/90 text-white w-full sm:w-auto text-sm sm:text-base"
                disabled={comparisonData.stores.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
              </Button>
            </div>

            {comparisonData.products.length > 0 && (
              <div className="mb-3 sm:mb-4 space-y-3 sm:space-y-4">
                <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                  <div className="flex-1 space-y-2">
                    <ProductSearchSuggestions
                      value={globalSearchTerm}
                      onChange={setGlobalSearchTerm}
                      onSelectProduct={handleAddProductFromSearch}
                      placeholder="Buscar e adicionar produtos da base de dados..."
                      className="w-full"
                      showSuggestions={true}
                    />
                    <ProductSearch
                      value={filters.search}
                      onChange={setSearch}
                      placeholder="Filtrar produtos na sua comparação..."
                      className="w-full"
                      showHistory={false}
                    />
                  </div>
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={filters.category}
                    onCategoryChange={setCategory}
                    className="md:w-64"
                  />
                </div>
                
                {filterStats.hasActiveFilters && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {filteredProducts.length} de {filterStats.totalProducts} produtos
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8"
                    >
                      Limpar filtros
                    </Button>
                  </div>
                )}
              </div>
            )}

            {comparisonData.stores.length === 0 && (
              <p className="text-muted-foreground italic">
                Adicione pelo menos um mercado antes de cadastrar produtos.
              </p>
            )}

            {comparisonData.products.length > 0 && (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="py-2 px-2 sm:px-4 border text-left text-xs sm:text-sm">Produto</th>
                        <th className="py-2 px-2 sm:px-4 border text-left text-xs sm:text-sm">Qtd</th>
                        <th className="py-2 px-2 sm:px-4 border text-left text-xs sm:text-sm">Un.</th>
                        {comparisonData.stores.map((store) => (
                          <th
                            key={store.id}
                            className="py-2 px-2 sm:px-4 border text-left text-xs sm:text-sm whitespace-nowrap"
                          >
                            {store.name}
                          </th>
                        ))}
                        <th className="py-2 px-2 sm:px-4 border text-center text-xs sm:text-sm">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product, index) => {
                        const originalIndex = comparisonData.products.findIndex(p => p.id === product.id);
                        return (
                          <tr key={product.id}>
                            <td className="py-2 px-2 sm:px-4 border text-xs sm:text-sm">{product.name}</td>
                            <td className="py-2 px-2 sm:px-4 border text-xs sm:text-sm">{product.quantity}</td>
                            <td className="py-2 px-2 sm:px-4 border text-xs sm:text-sm">{product.unit}</td>
                            {comparisonData.stores.map((store) => (
                              <td key={store.id} className="py-2 px-2 sm:px-4 border text-xs sm:text-sm whitespace-nowrap">
                              {product.prices[store.id] ? (
                                `R$ ${product.prices[store.id].toFixed(2)}`
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </td>
                          ))}
                          <td className="py-2 px-2 sm:px-4 border text-center">
                            <div className="flex justify-center space-x-1 sm:space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditProduct(originalIndex)}
                                className="h-8 w-8 text-app-primary hover:text-app-primary/80 hover:bg-primary/10"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteProduct(originalIndex)}
                                className="h-8 w-8 text-app-error hover:text-app-error/80 hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {comparisonData.products.length > 0 && (
              <div className="mt-4 sm:mt-6">
                <Button
                  onClick={doComparison} // Chamada para a função "Fazer Comparação"
                  className="bg-app-success hover:bg-app-success/90 text-white w-full sm:w-auto text-sm sm:text-base"
                  disabled={isProcessingComparison} // Usa o novo estado de loading
                >
                  {isProcessingComparison
                    ? "Processando..."
                    : "Fazer Comparação"}
                </Button>
                {!isSignedIn && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
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

          <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-card rounded-lg shadow border">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              Salvar esta Comparação
            </h3>
            <PriceTable comparisonData={comparisonData} />{" "}
            {/* <-- MOVIDO AQUI */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
              <Button
                onClick={saveComparisonData}
                className="bg-app-primary hover:bg-app-primary/90 text-white w-full sm:w-auto text-sm sm:text-base"
                disabled={
                  isSavingComparison ||
                  !isSignedIn ||
                  comparisonData.products.length === 0
                }
              >
                {isSavingComparison ? "Salvando..." : "Salvar Comparação"}
              </Button>
              <Button
                onClick={handleExportPdf}
                variant="outline"
                disabled={!isSignedIn}
                title={!isSignedIn ? "Faça login para baixar o PDF" : undefined}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                <Download className="mr-2 h-4 w-4" /> Baixar PDF
              </Button>
            </div>
            {!isSignedIn && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Faça login para salvar ou exportar suas comparações.
              </p>
            )}
          </div>

          {/* Botões para Editar ou Iniciar Nova Comparação */}
          <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-card rounded-lg shadow border">
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button
                onClick={() => {
                  setIsEditingMode(true);
                  setShowResults(false);
                }}
                className="bg-app-warning hover:bg-app-warning/90 text-white w-full sm:w-auto text-sm sm:text-base"
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
                className="bg-app-error hover:bg-app-error/90 text-white w-full sm:w-auto text-sm sm:text-base"
              >
                <Plus className="mr-2 h-4 w-4" /> Nova Comparação
              </Button>
            </div>
          </div>
        </>
      )}
      {/* Drawer para reaproveitar comparações salvas */}
      <LoadComparisonDrawer
        open={isLoadDrawerOpen}
        onOpenChange={setIsLoadDrawerOpen}
        onSelect={(data) => {
          setComparisonData(data);
          setIsEditingMode(true);
          setShowResults(false);
        }}
      />
    </div>
  );
};

const ComparisonForm: React.FC = () => {
  return (
    <ErrorBoundaryWithRetry
      context={{
        component: 'ComparisonForm',
        feature: 'price-comparison'
      }}
    >
      <ComparisonFormContent />
    </ErrorBoundaryWithRetry>
  );
};

export default ComparisonForm;
