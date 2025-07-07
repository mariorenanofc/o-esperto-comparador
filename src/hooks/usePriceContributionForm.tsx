
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
    console.log('=== ATUALIZANDO LOCALIZAÇÃO ===');
    console.log('City:', city);
    console.log('State:', state);
    
    if (city && state) {
      setFormData(prev => ({
        ...prev,
        city,
        state
      }));
      console.log('Localização atualizada no formulário');
    }
  }, [city, state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== INICIANDO SUBMISSÃO DO FORMULÁRIO ===');
    console.log('Event:', e);
    console.log('Form data:', formData);
    console.log('User:', user?.id);
    console.log('Profile:', profile);
    console.log('Props:', props);
    
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
      // Verificar usuário
      if (!user) {
        console.error('❌ Usuário não encontrado');
        toast.error('Você precisa estar logado para contribuir', { id: 'contribution-submit' });
        return;
      }
      console.log('✅ Usuário verificado:', user.id);

      if (!profile) {
        console.error('❌ Profile não encontrado');
        toast.error('Profile não encontrado. Tente fazer login novamente.', { id: 'contribution-submit' });
        return;
      }
      console.log('✅ Profile verificado:', profile.name || profile.email);

      // Validações básicas
      console.log('=== INICIANDO VALIDAÇÕES ===');
      
      if (!formData.productName.trim()) {
        console.error('❌ Nome do produto vazio');
        toast.error('Nome do produto é obrigatório', { id: 'contribution-submit' });
        return;
      }
      console.log('✅ Nome do produto válido:', formData.productName);

      if (!formData.storeName.trim()) {
        console.error('❌ Nome da loja vazio');
        toast.error('Nome da loja é obrigatório', { id: 'contribution-submit' });
        return;
      }
      console.log('✅ Nome da loja válido:', formData.storeName);

      if (formData.price <= 0) {
        console.error('❌ Preço inválido:', formData.price);
        toast.error('Preço deve ser maior que zero', { id: 'contribution-submit' });
        return;
      }
      console.log('✅ Preço válido:', formData.price);

      if (!formData.city.trim() || !formData.state.trim()) {
        console.error('❌ Localização inválida:', { city: formData.city, state: formData.state });
        toast.error('Localização é obrigatória', { id: 'contribution-submit' });
        return;
      }
      console.log('✅ Localização válida:', formData.city, formData.state);

      console.log('✅ Todas as validações passaram!');
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
      
      const contributorName = profile.name || profile.email || 'Usuário';
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
      console.log('Resetando formulário...');
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
      console.log('Formulário resetado');
      
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
      console.error('Tipo do erro:', typeof error);
      console.error('Erro completo:', error);
      console.error('Mensagem do erro:', error instanceof Error ? error.message : String(error));
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
      
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

  console.log('=== ESTADO ATUAL DO HOOK ===');
  console.log('isSubmitting:', isSubmitting);
  console.log('locationLoading:', locationLoading);
  console.log('formData:', formData);
  console.log('user:', user?.id);
  console.log('profile:', profile?.name || profile?.email);

  return {
    isSubmitting,
    formData,
    setFormData,
    handleSubmit,
    locationLoading,
  };
};
