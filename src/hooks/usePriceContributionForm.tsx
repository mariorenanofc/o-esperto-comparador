
import { useState } from 'react';
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
    city: city || '',
    state: state || '',
    userId: '',
    timestamp: new Date(),
    verified: false,
    quantity: 1,
    unit: 'unidade'
  });

  const validateContribution = async (contribution: PriceContribution) => {
    if (!user) {
      return { isValid: false, message: 'Você precisa estar logado para contribuir' };
    }

    try {
      const validation = await supabaseDailyOffersService.validateUserContribution(
        contribution,
        user.id
      );
      return validation;
    } catch (error) {
      console.error('Error validating contribution:', error);
      return { isValid: false, message: 'Erro ao validar contribuição' };
    }
  };

  const submitContribution = async (contribution: PriceContribution) => {
    if (!user || !profile) {
      toast.error('Você precisa estar logado para contribuir');
      return false;
    }

    setIsSubmitting(true);

    try {
      // Validar contribuição primeiro
      const validation = await validateContribution(contribution);
      
      if (!validation.isValid) {
        toast.error(validation.message || 'Contribuição inválida');
        return false;
      }

      // Submeter contribuição
      await supabaseDailyOffersService.submitPriceContribution(
        contribution,
        user.id,
        profile.name || profile.email
      );

      toast.success('Contribuição enviada com sucesso!');
      return true;
    } catch (error) {
      console.error('Error submitting contribution:', error);
      toast.error('Erro ao enviar contribuição');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitContribution(formData);
    if (success) {
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
    }
  };

  const updateLocationWhenLoaded = (newCity: string, newState: string) => {
    if (newCity && newState && !formData.city && !formData.state) {
      setFormData(prev => ({
        ...prev,
        city: newCity,
        state: newState
      }));
    }
  };

  return {
    submitContribution,
    validateContribution,
    isSubmitting,
    formData,
    setFormData,
    handleSubmit,
    locationLoading,
    city,
    state,
    updateLocationWhenLoaded,
  };
};
