
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { dailyOffersService } from "@/services/dailyOffersService";
import { PriceContribution } from "@/lib/types";

interface PriceContributionFormProps {
  onClose: () => void;
}

const PriceContributionForm: React.FC<PriceContributionFormProps> = ({ onClose }) => {
  const { user } = useUser();
  const { city, state, loading: locationLoading } = useGeolocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PriceContribution>({
    productName: "",
    storeName: "",
    price: 0,
    quantity: 1,
    unit: "unidade",
    city: "",
    state: "",
  });

  // Atualizar localização automaticamente quando carregada
  React.useEffect(() => {
    if (city && state && !formData.city && !formData.state) {
      setFormData(prev => ({
        ...prev,
        city: city,
        state: state
      }));
    }
  }, [city, state, formData.city, formData.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Você precisa estar logado para compartilhar preços.");
      return;
    }

    if (!formData.productName || !formData.storeName || formData.price <= 0) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!formData.city || !formData.state) {
      toast.error("Por favor, preencha a cidade e estado.");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Starting form submission process...');
      
      // Obter ofertas existentes
      const existingOffers = await dailyOffersService.getTodaysOffers();
      console.log('Existing offers retrieved for validation:', existingOffers);
      
      // Primeiro validar se o usuário já contribuiu com este produto
      const userValidation = dailyOffersService.validateUserContribution(formData, user.id, existingOffers);
      console.log('User validation result:', userValidation);
      
      if (!userValidation.isValid) {
        toast.error(userValidation.message || "Erro na validação do usuário.");
        setIsSubmitting(false);
        return;
      }
      
      // Depois validar se o preço não está muito diferente de ofertas existentes
      const priceValidation = dailyOffersService.validatePriceContribution(formData, existingOffers);
      console.log('Price validation result:', priceValidation);
      
      if (!priceValidation.isValid && priceValidation.conflictingPrice) {
        const confirmSubmit = window.confirm(
          `Atenção: O preço informado (R$ ${formData.price.toFixed(2)}) está ${priceValidation.priceDifference?.toFixed(1)}% diferente do preço já informado por ${priceValidation.conflictingContributor} (R$ ${priceValidation.conflictingPrice?.toFixed(2)}) para um produto similar no mesmo estabelecimento. Deseja continuar mesmo assim?`
        );
        
        if (!confirmSubmit) {
          setIsSubmitting(false);
          return;
        }
      }

      // Obter nome do usuário do Clerk
      const userName = user.fullName || user.firstName || user.username || "Usuário Anônimo";

      // Submeter a contribuição
      console.log('Submitting contribution to service...');
      const newOffer = await dailyOffersService.submitPriceContribution(formData, user.id, userName);
      console.log('Contribution submitted successfully:', newOffer);
      
      toast.success("Preço compartilhado com sucesso! Obrigado pela contribuição.");
      
      // Reset form
      setFormData({
        productName: "",
        storeName: "",
        price: 0,
        quantity: 1,
        unit: "unidade",
        city: city || "",
        state: state || "",
      });
      
      onClose();
      
      // Verificar se a contribuição foi salva
      setTimeout(async () => {
        const updatedOffers = await dailyOffersService.getTodaysOffers();
        console.log('Updated offers after submission:', updatedOffers);
      }, 1000);
      
    } catch (error) {
      console.error("Erro ao compartilhar preço:", error);
      toast.error("Erro ao compartilhar preço. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Compartilhar Preço</CardTitle>
        <CardDescription>
          Ajude nossa comunidade com informações de preços atualizadas
        </CardDescription>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-2">Aviso Importante:</p>
              <p>
                A plataforma não se responsabiliza pelos preços sugeridos pelos usuários. 
                Os preços compartilhados podem não ser válidos, estar desatualizados ou 
                sofrer alterações. Recomendamos sempre verificar os preços diretamente 
                com o estabelecimento antes de efetuar a compra.
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder={locationLoading ? "Detectando..." : "Ex: Trindade"}
                required
              />
            </div>
            <div>
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder={locationLoading ? "..." : "Ex: PE"}
                required
                maxLength={2}
              />
            </div>
          </div>

          {locationLoading && (
            <div className="text-sm text-blue-600">
              📍 Detectando sua localização automaticamente...
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-app-blue hover:bg-blue-700"
            >
              {isSubmitting ? "Enviando..." : "Compartilhar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PriceContributionForm;
