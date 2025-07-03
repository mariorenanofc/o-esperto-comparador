
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
    
    console.log('Form submission started');
    
    if (!user) {
      toast.error('Você precisa estar logado para contribuir');
      return;
    }

    if (!profile) {
      toast.error('Profile não encontrado');
      return;
    }

    if (!formData.productName || !formData.storeName || formData.price <= 0) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!formData.city || !formData.state) {
      toast.error('Não foi possível detectar sua localização');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Validating contribution...');
      const validation = await supabaseDailyOffersService.validateUserContribution(
        formData,
        user.id
      );
      
      if (!validation.isValid) {
        toast.error(validation.message || 'Contribuição inválida');
        setIsSubmitting(false);
        return;
      }

      console.log('Submitting contribution...');
      await supabaseDailyOffersService.submitPriceContribution(
        formData,
        user.id,
        profile.name || profile.email
      );

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
      console.error('Error submitting contribution:', error);
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
