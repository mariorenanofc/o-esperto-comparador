
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabaseDailyOffersService } from '@/services/supabase/dailyOffersService';
import { PriceContribution } from '@/lib/types';
import { toast } from 'sonner';

export const usePriceContributionForm = () => {
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return {
    submitContribution,
    validateContribution,
    isSubmitting,
  };
};
