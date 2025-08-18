import React, { useEffect, useMemo, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { comparisonService } from "@/services/comparisonService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ComparisonData, Product, Store } from "@/lib/types";

interface LoadComparisonDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (data: ComparisonData) => void;
}

const LoadComparisonDrawer: React.FC<LoadComparisonDrawerProps> = ({ open, onOpenChange, onSelect }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!open || !user) return;
      setLoading(true);
      try {
        const list = await comparisonService.getUserComparisons(user.id);
        setItems(list || []);
      } catch (e) {
        console.error(e);
        toast.error("Não foi possível carregar suas comparações salvas.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, user]);

  const handleUse = (item: any) => {
    try {
      const data = toComparisonData(item);
      if (!data.products.length || !data.stores.length) {
        toast.error("Esta comparação não possui dados suficientes.");
        return;
      }
      onSelect(data);
      onOpenChange(false);
      toast.success("Comparação reaproveitada com sucesso!");
    } catch (e) {
      console.error(e);
      toast.error("Falha ao processar a comparação selecionada.");
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Reaproveitar Comparação Salva</DrawerTitle>
          <DrawerDescription>Escolha uma comparação para carregar produtos e mercados automaticamente.</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {loading && <div className="text-muted-foreground">Carregando...</div>}
          {!loading && items.length === 0 && (
            <div className="text-muted-foreground">Você ainda não possui comparações salvas.</div>
          )}
          {!loading && items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded border bg-card">
              <div>
                <div className="font-medium">{item.title || "Comparação"}</div>
                <div className="text-xs text-muted-foreground">
                  {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
                </div>
              </div>
              <Button onClick={() => handleUse(item)} className="bg-app-primary text-white hover:bg-app-primary/90">Usar</Button>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4 flex justify-end">
          <DrawerClose asChild>
            <Button variant="outline">Fechar</Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default LoadComparisonDrawer;

// Helpers
function toComparisonData(item: any): ComparisonData {
  // If offline format already contains products and stores
  if (Array.isArray(item.products) && Array.isArray(item.stores)) {
    return {
      products: normalizeProducts(item.products, item.stores),
      stores: normalizeStores(item.stores),
      date: item.date ? new Date(item.date) : undefined,
    };
  }

  // Supabase format with prices: [{ price, product: {..}, store: {..} }]
  const prices: any[] = item.prices || [];
  const storesMap = new Map<string, Store>();
  const productsMap = new Map<string, Product>();

  for (const row of prices) {
    const prod = row.product;
    const store = row.store;
    if (!prod || !store) continue;

    const sId = store.id;
    const pId = prod.id;

    if (!storesMap.has(sId)) {
      storesMap.set(sId, { id: sId, name: store.name });
    }

    if (!productsMap.has(pId)) {
      productsMap.set(pId, {
        id: pId,
        name: prod.name,
        quantity: prod.quantity || 1,
        unit: prod.unit || "unidade",
        category: prod.category || "outros",
        prices: {},
      });
    }

    const p = productsMap.get(pId)!;
    p.prices[sId] = Number(row.price) || 0;
  }

  return {
    products: Array.from(productsMap.values()),
    stores: Array.from(storesMap.values()),
  };
}

function normalizeStores(stores: any[]): Store[] {
  return stores.map((s) => ({ id: s.id || s.name, name: s.name }));
}

function normalizeProducts(products: any[], stores: Store[]): Product[] {
  return products.map((p) => ({
    id: p.id || `${p.name}-${Math.random().toString(36).slice(2, 8)}`,
    name: p.name,
    quantity: p.quantity ?? 1,
    unit: p.unit || "unidade",
    category: p.category || "outros",
    prices: p.prices || {},
  }));
}
