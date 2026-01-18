import React, { useState } from "react";
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Store,
  TrendingDown,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shoppingListService, ShoppingListItem } from "@/services/shoppingListService";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const SmartShoppingList: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newItem, setNewItem] = useState("");

  // Get or create active list
  const { data: activeList, isLoading: listLoading } = useQuery({
    queryKey: ["shopping-list-active", user?.id],
    queryFn: async () => {
      if (!user) return null;
      let list = await shoppingListService.getActiveList(user.id);
      if (!list) {
        list = await shoppingListService.createList(user.id);
      }
      return list;
    },
    enabled: !!user,
  });

  // Get list items
  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["shopping-list-items", activeList?.id],
    queryFn: () => shoppingListService.getListItems(activeList!.id),
    enabled: !!activeList,
  });

  // Get optimized view
  const { data: optimized } = useQuery({
    queryKey: ["shopping-list-optimized", activeList?.id, items.length],
    queryFn: () => shoppingListService.optimizeList(activeList!.id),
    enabled: !!activeList && items.length > 0,
  });

  const addItemMutation = useMutation({
    mutationFn: (productName: string) =>
      shoppingListService.addItem(activeList!.id, { product_name: productName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list-items"] });
      queryClient.invalidateQueries({ queryKey: ["shopping-list-active"] });
      setNewItem("");
      toast.success("Item adicionado!");
    },
    onError: () => {
      toast.error("Erro ao adicionar item");
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: ({ id, checked }: { id: string; checked: boolean }) =>
      shoppingListService.toggleItemChecked(id, checked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list-items"] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (id: string) =>
      shoppingListService.removeItem(id, activeList!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list-items"] });
      queryClient.invalidateQueries({ queryKey: ["shopping-list-active"] });
      toast.success("Item removido");
    },
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    addItemMutation.mutate(newItem.trim());
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Faça login para usar a lista de compras inteligente.
        </CardContent>
      </Card>
    );
  }

  if (listLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main List Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-hero-primary" />
              Lista Inteligente
            </CardTitle>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add Item Form */}
          <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Adicionar produto... ex: Arroz 5kg"
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={addItemMutation.isPending || !newItem.trim()}
              className="bg-gradient-to-r from-hero-primary to-hero-accent"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </form>

          {/* Items List */}
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Sua lista está vazia.</p>
              <p className="text-sm">Adicione produtos para ver as melhores ofertas!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                    item.is_checked
                      ? "bg-muted/50 opacity-60"
                      : "bg-white dark:bg-gray-800"
                  }`}
                >
                  <button
                    onClick={() =>
                      toggleItemMutation.mutate({ id: item.id, checked: !item.is_checked })
                    }
                    className="text-hero-primary hover:scale-110 transition-transform"
                  >
                    {item.is_checked ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${item.is_checked ? "line-through" : ""}`}>
                      {item.quantity}x {item.product_name}
                    </div>
                    {item.best_store && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Store className="w-3 h-3" />
                        <span>{item.best_store}</span>
                        {item.best_price && (
                          <Badge variant="secondary" className="text-xs">
                            R$ {item.best_price.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItemMutation.mutate(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Card */}
      {activeList && items.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Estimado</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {activeList.total_estimated.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Economia</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                  <TrendingDown className="w-5 h-5" />
                  R$ {activeList.total_savings.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimized by Store */}
      {optimized && Object.keys(optimized.byStore).length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Store className="w-5 h-5" />
              Roteiro Otimizado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(optimized.byStore).map(([store, storeItems]) => (
              <div key={store} className="p-3 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Store className="w-4 h-4 text-hero-primary" />
                  {store}
                  <Badge variant="outline">{storeItems.length} itens</Badge>
                </h4>
                <div className="text-sm text-muted-foreground">
                  {storeItems.map((item) => item.product_name).join(", ")}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartShoppingList;
