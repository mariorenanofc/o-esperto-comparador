
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ProductFormData, Store } from "@/lib/types";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductFormData) => void;
  stores: Store[];
  editProduct?: ProductFormData;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  stores,
  editProduct,
}) => {
  const [product, setProduct] = useState<ProductFormData>(
    editProduct || {
      name: "",
      quantity: 1,
      unit: "unid",
      prices: {},
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handlePriceChange = (storeId: string, price: string) => {
    const priceValue = price === "" ? 0 : parseFloat(price);
    setProduct({
      ...product,
      prices: {
        ...product.prices,
        [storeId]: priceValue,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(product);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editProduct ? "Editar Produto" : "Adicionar Novo Produto"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                name="name"
                value={product.name}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Ex: Arroz"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantidade
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={product.quantity}
                onChange={handleChange}
                className="col-span-3"
                min={1}
                step={1}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                Unidade
              </Label>
              <Input
                id="unit"
                name="unit"
                value={product.unit}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Ex: kg, L, unid"
                required
              />
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Preços por Mercado:</h3>
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="grid grid-cols-4 items-center gap-4 mb-2"
                >
                  <Label htmlFor={`price-${store.id}`} className="text-right">
                    {store.name}
                  </Label>
                  <Input
                    id={`price-${store.id}`}
                    type="number"
                    value={product.prices[store.id] || ""}
                    onChange={(e) =>
                      handlePriceChange(store.id, e.target.value)
                    }
                    className="col-span-3"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-app-green text-white">
              {editProduct ? "Atualizar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
