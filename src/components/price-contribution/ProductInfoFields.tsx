
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriceContribution } from "@/lib/types";

interface ProductInfoFieldsProps {
  formData: PriceContribution;
  setFormData: (data: PriceContribution) => void;
}

const ProductInfoFields: React.FC<ProductInfoFieldsProps> = ({ formData, setFormData }) => {
  return (
    <>
      <div>
        <Label htmlFor="productName">Nome do Produto *</Label>
        <Input
          id="productName"
          value={formData.productName}
          onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
          placeholder="Ex: Arroz Tio João 5kg"
          required
        />
      </div>

      <div>
        <Label htmlFor="storeName">Nome da Loja *</Label>
        <Input
          id="storeName"
          value={formData.storeName}
          onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
          placeholder="Ex: Supermercado ABC"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Quantidade</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div>
          <Label htmlFor="unit">Unidade</Label>
          <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unidade">Unidade</SelectItem>
              <SelectItem value="kg">Quilograma</SelectItem>
              <SelectItem value="g">Grama</SelectItem>
              <SelectItem value="l">Litro</SelectItem>
              <SelectItem value="ml">Mililitro</SelectItem>
              <SelectItem value="pacote">Pacote</SelectItem>
              <SelectItem value="caixa">Caixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="price">Preço (R$) *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          placeholder="0,00"
          required
        />
      </div>
    </>
  );
};

export default ProductInfoFields;
