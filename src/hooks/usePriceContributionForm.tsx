
import { useState } from "react";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { dailyOffersService } from "@/services/dailyOffersService";
import { PriceContribution } from "@/lib/types";

interface UsePriceContributionFormProps {
  onClose: () => void;
}

export const usePriceContributionForm = ({ onClose }: UsePriceContributionFormProps) => {
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
  const updateLocationWhenLoaded = (city: string, state: string) => {
    if (city && state && !formData.city && !formData.state) {
      setFormData(prev => ({
        ...prev,
        city: city,
        state: state
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      productName: "",
      storeName: "",
      price: 0,
      quantity: 1,
      unit: "unidade",
      city: city || "",
      state: state || "",
    });
  };

  const validateForm = (): boolean => {
    if (!user) {
      toast.error("Você precisa estar logado para compartilhar preços.");
      return false;
    }

    if (!formData.productName || !formData.storeName || formData.price <= 0) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return false;
    }

    if (!formData.city || !formData.state) {
      toast.error("Por favor, preencha a cidade e estado.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Starting form submission process...');
      
      // Obter ofertas existentes
      const existingOffers = await dailyOffersService.getTodaysOffers();
      console.log('Existing offers retrieved for validation:', existingOffers);
      
      // Primeiro validar se o usuário já contribuiu com este produto
      const userValidation = dailyOffersService.validateUserContribution(formData, user!.id, existingOffers);
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
      const userName = user!.fullName || user!.firstName || user!.username || "Usuário Anônimo";

      // Submeter a contribuição
      console.log('Submitting contribution to service...');
      const newOffer = await dailyOffersService.submitPriceContribution(formData, user!.id, userName);
      console.log('Contribution submitted successfully:', newOffer);
      
      toast.success("Preço compartilhado com sucesso! Obrigado pela contribuição.");
      
      // Reset form
      resetForm();
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

  return {
    formData,
    setFormData,
    isSubmitting,
    locationLoading,
    city,
    state,
    handleSubmit,
    updateLocationWhenLoaded,
  };
};
