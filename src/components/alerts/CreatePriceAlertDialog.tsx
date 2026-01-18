import React, { useState } from "react";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { priceAlertService, CreatePriceAlertInput } from "@/services/priceAlertService";
import { toast } from "sonner";

interface CreatePriceAlertDialogProps {
  defaultProductName?: string;
  defaultPrice?: number;
  defaultStore?: string;
  defaultCity?: string;
  defaultState?: string;
  trigger?: React.ReactNode;
}

export const CreatePriceAlertDialog: React.FC<CreatePriceAlertDialogProps> = ({
  defaultProductName = "",
  defaultPrice,
  defaultStore = "",
  defaultCity = "",
  defaultState = "",
  trigger,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState<CreatePriceAlertInput>({
    product_name: defaultProductName,
    target_price: defaultPrice ? defaultPrice * 0.9 : 0, // 10% discount by default
    current_price: defaultPrice,
    store_name: defaultStore,
    city: defaultCity,
    state: defaultState,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreatePriceAlertInput) =>
      priceAlertService.createAlert(user!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-alerts"] });
      toast.success("Alerta criado!", {
        description: "Você será notificado quando o preço baixar.",
      });
      setOpen(false);
    },
    onError: () => {
      toast.error("Erro ao criar alerta");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Faça login para criar alertas");
      return;
    }
    if (!formData.product_name || formData.target_price <= 0) {
      toast.error("Preencha o produto e o preço alvo");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="w-4 h-4" />
            Criar Alerta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-hero-primary" />
            Criar Alerta de Preço
          </DialogTitle>
          <DialogDescription>
            Receba uma notificação quando o preço do produto atingir seu valor alvo.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Produto</Label>
            <Input
              id="product"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              placeholder="Ex: Arroz 5kg"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_price">Preço Atual (R$)</Label>
              <Input
                id="current_price"
                type="number"
                step="0.01"
                value={formData.current_price || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  current_price: parseFloat(e.target.value) || undefined 
                })}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target_price">Preço Alvo (R$)</Label>
              <Input
                id="target_price"
                type="number"
                step="0.01"
                value={formData.target_price || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  target_price: parseFloat(e.target.value) || 0 
                })}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="store">Loja (opcional)</Label>
            <Input
              id="store"
              value={formData.store_name || ""}
              onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
              placeholder="Qualquer loja"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade (opcional)</Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Qualquer cidade"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state || ""}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="UF"
                maxLength={2}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-hero-primary to-hero-accent"
            >
              {createMutation.isPending ? "Criando..." : "Criar Alerta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePriceAlertDialog;
