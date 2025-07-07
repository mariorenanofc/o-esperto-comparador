
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
    
    console.log('=== INICIANDO SUBMISSÃO DO FORMULÁRIO ===');
    console.log('Form data:', formData);
    console.log('User:', user?.id);
    console.log('Profile:', profile);
    
    // Mostrar loading imediatamente
    setIsSubmitting(true);
    toast.loading('Enviando contribuição...', { id: 'contribution-submit' });

    try {
      if (!user) {
        console.error('Usuário não encontrado');
        toast.error('Você precisa estar logado para contribuir', { id: 'contribution-submit' });
        return;
      }

      if (!profile) {
        console.error('Profile não encontrado');
        toast.error('Profile não encontrado. Tente fazer login novamente.', { id: 'contribution-submit' });
        return;
      }

      // Validações básicas
      if (!formData.productName.trim()) {
        toast.error('Nome do produto é obrigatório', { id: 'contribution-submit' });
        return;
      }

      if (!formData.storeName.trim()) {
        toast.error('Nome da loja é obrigatório', { id: 'contribution-submit' });
        return;
      }

      if (formData.price <= 0) {
        toast.error('Preço deve ser maior que zero', { id: 'contribution-submit' });
        return;
      }

      if (!formData.city.trim() || !formData.state.trim()) {
        toast.error('Localização é obrigatória', { id: 'contribution-submit' });
        return;
      }

      console.log('Validações passaram, iniciando validação do servidor...');
      
      // Preparar dados para validação
      const contributionData = {
        ...formData,
        userId: user.id,
        timestamp: new Date()
      };

      console.log('Dados preparados:', contributionData);

      const validation = await supabaseDailyOffersService.validateUserContribution(
        contributionData,
        user.id
      );
      
      console.log('Resultado da validação:', validation);
      
      if (!validation.isValid) {
        console.error('Validação falhou:', validation.message);
        toast.error(validation.message || 'Contribuição inválida', { id: 'contribution-submit' });
        return;
      }

      if (validation.priceDifference && validation.priceDifference > 50) {
        const confirmed = window.confirm(
          `${validation.message} Deseja continuar mesmo assim?`
        );
        if (!confirmed) {
          toast.dismiss('contribution-submit');
          return;
        }
      }

      console.log('Enviando contribuição...');
      
      const contributorName = profile.name || profile.email || 'Usuário';
      
      await supabaseDailyOffersService.submitPriceContribution(
        contributionData,
        user.id,
        contributorName
      );

      console.log('Contribuição enviada com sucesso!');
      toast.success('🎉 Contribuição enviada com sucesso! Obrigado por ajudar nossa comunidade!', { 
        id: 'contribution-submit',
        duration: 5000
      });
      
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
      
      // Fechar modal após sucesso
      setTimeout(() => {
        if (props?.onClose) {
          props.onClose();
        }
      }, 1000);

    } catch (error) {
      console.error('=== ERRO AO ENVIAR CONTRIBUIÇÃO ===');
      console.error('Detalhes do erro:', error);
      console.error('Mensagem do erro:', error instanceof Error ? error.message : String(error));
      
      toast.error('❌ Erro ao enviar contribuição. Tente novamente.', { 
        id: 'contribution-submit',
        duration: 5000 
      });
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
