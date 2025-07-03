
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabaseDailyOffersService } from '@/services/supabase/dailyOffersService';
import { PriceContribution } from '@/lib/types';
import { toast } from 'sonner';

interface UsePriceContributionFormProps {
  onClose?: () => void;
}

export const usePriceContributionForm = (props?: UsePriceContributionFormProps) => {
  const { user, profile } = useAuth();
  const { city, state, loading: locationLoading } = useGeolocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PriceContribution>({
    productName: '',
    price: 0,
    storeName: '',
    city: '',
    state: '',
    userId: '',
    timestamp: new Date(),
    verified: false,
    quantity: 1,
    unit: 'unidade'
  });

  // Atualizar dados de localização automaticamente
  useEffect(() => {
    if (city && state) {
      setFormData(prev => ({
        ...prev,
        city,
        state
      }));
    }
  }, [city, state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== PRICE CONTRIBUTION FORM SUBMISSION ===');
    console.log('Form data:', formData);
    console.log('User:', user?.id);
    console.log('Profile:', profile);
    
    if (!user) {
      console.error('No user found');
      toast.error('Você precisa estar logado para contribuir');
      return;
    }

    if (!profile) {
      console.error('No profile found');
      toast.error('Profile não encontrado. Tente fazer login novamente.');
      return;
    }

    // Validações básicas
    if (!formData.productName.trim()) {
      toast.error('Nome do produto é obrigatório');
      return;
    }

    if (!formData.storeName.trim()) {
      toast.error('Nome da loja é obrigatório');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Preço deve ser maior que zero');
      return;
    }

    if (!formData.city.trim() || !formData.state.trim()) {
      toast.error('Localização é obrigatória');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Starting validation...');
      
      // Preparar dados para validação
      const contributionData = {
        ...formData,
        userId: user.id,
        timestamp: new Date()
      };

      const validation = await supabaseDailyOffersService.validateUserContribution(
        contributionData,
        user.id
      );
      
      console.log('Validation result:', validation);
      
      if (!validation.isValid) {
        console.error('Validation failed:', validation.message);
        toast.error(validation.message || 'Contribuição inválida');
        return;
      }

      if (validation.priceDifference && validation.priceDifference > 50) {
        const confirmed = window.confirm(
          `${validation.message} Deseja continuar mesmo assim?`
        );
        if (!confirmed) {
          return;
        }
      }

      console.log('Submitting contribution...');
      
      const contributorName = profile.name || profile.email || 'Usuário';
      
      await supabaseDailyOffersService.submitPriceContribution(
        contributionData,
        user.id,
        contributorName
      );

      console.log('Contribution submitted successfully!');
      toast.success('Contribuição enviada com sucesso! Obrigado por ajudar nossa comunidade! 🎉');
      
      // Reset form
      setFormData({
        productName: '',
        price: 0,
        storeName: '',
        city: city || '',
        state: state || '',
        userId: '',
        timestamp: new Date(),
        verified: false,
        quantity: 1,
        unit: 'unidade'
      });
      
      if (props?.onClose) {
        props.onClose();
      }
    } catch (error) {
      console.error('=== ERROR SUBMITTING CONTRIBUTION ===');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      
      toast.error('Erro ao enviar contribuição. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    formData,
    setFormData,
    handleSubmit,
    locationLoading,
  };
};
