
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { PriceContribution } from '@/lib/types';
import { supabaseDailyOffersService } from '@/services/supabase/dailyOffersService';
import { toast } from 'sonner';

interface UseFormSubmissionProps {
  onClose?: () => void;
}

export const useFormSubmission = (props?: UseFormSubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitContribution = async (
    formData: PriceContribution,
    user: User,
    profile: any,
    resetForm: (city: string, state: string) => void,
    city: string,
    state: string
  ) => {
    console.log('=== INICIANDO SUBMISSÃO DO FORMULÁRIO ===');
    console.log('Form data:', formData);
    console.log('User:', user?.id);
    console.log('Profile:', profile);
    
    // Verificar se já está submetendo
    if (isSubmitting) {
      console.log('Já está submetendo, cancelando...');
      return;
    }
    
    // Mostrar loading imediatamente
    setIsSubmitting(true);
    console.log('Estado isSubmitting definido como true');
    
    // Mostrar toast de loading
    toast.loading('Enviando contribuição...', { id: 'contribution-submit' });
    console.log('Toast de loading exibido');

    try {
      // Verificar se não há profile e criar um nome alternativo
      let contributorName = 'Usuário';
      if (profile) {
        contributorName = profile.name || profile.email || 'Usuário';
        console.log('✅ Profile encontrado:', contributorName);
      } else {
        // Se não tiver profile, usar o email do usuário ou um padrão
        contributorName = user.email || user.user_metadata?.name || user.user_metadata?.full_name || 'Usuário';
        console.log('⚠️ Profile não encontrado, usando dados do usuário:', contributorName);
      }

      console.log('=== INICIANDO VALIDAÇÃO DO SERVIDOR ===');
      
      // Preparar dados para validação
      const contributionData = {
        ...formData,
        userId: user.id,
        timestamp: new Date()
      };

      console.log('Dados preparados para validação:', contributionData);

      // Validação no servidor
      const validation = await supabaseDailyOffersService.validateUserContribution(
        contributionData,
        user.id
      );
      
      console.log('Resultado da validação do servidor:', validation);
      
      if (!validation.isValid) {
        console.error('❌ Validação do servidor falhou:', validation.message);
        toast.error(validation.message || 'Contribuição inválida', { id: 'contribution-submit' });
        return;
      }
      console.log('✅ Validação do servidor passou');

      // Confirmação para preços muito diferentes
      if (validation.priceDifference && validation.priceDifference > 50) {
        console.log('⚠️ Preço muito diferente da média, solicitando confirmação');
        const confirmed = window.confirm(
          `${validation.message} Deseja continuar mesmo assim?`
        );
        if (!confirmed) {
          console.log('❌ Usuário cancelou devido à diferença de preço');
          toast.dismiss('contribution-submit');
          return;
        }
        console.log('✅ Usuário confirmou apesar da diferença de preço');
      }

      console.log('=== ENVIANDO CONTRIBUIÇÃO PARA O SERVIDOR ===');
      console.log('Nome do contribuidor:', contributorName);
      
      await supabaseDailyOffersService.submitPriceContribution(
        contributionData,
        user.id,
        contributorName
      );

      console.log('🎉 Contribuição enviada com sucesso!');
      toast.success('🎉 Contribuição enviada com sucesso! Obrigado por ajudar nossa comunidade!', { 
        id: 'contribution-submit',
        duration: 5000
      });
      
      // Reset form
      resetForm(city, state);
      
      // Fechar modal após sucesso
      console.log('Fechando modal em 1 segundo...');
      setTimeout(() => {
        if (props?.onClose) {
          console.log('Chamando onClose...');
          props.onClose();
        }
      }, 1000);

    } catch (error) {
      console.error('=== ERRO AO ENVIAR CONTRIBUIÇÃO ===');
      console.error('Erro completo:', error);
      
      toast.error('❌ Erro ao enviar contribuição. Tente novamente.', { 
        id: 'contribution-submit',
        duration: 5000 
      });
    } finally {
      console.log('=== FINALIZANDO SUBMISSÃO ===');
      setIsSubmitting(false);
      console.log('Estado isSubmitting definido como false');
    }
  };

  return {
    isSubmitting,
    submitContribution
  };
};
