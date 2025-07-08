
import { PriceContribution } from '@/lib/types';
import { User } from '@supabase/supabase-js';

export const useFormValidation = () => {
  const validateForm = (
    formData: PriceContribution,
    user: User | null
  ): { isValid: boolean; errorMessage?: string } => {
    console.log('=== INICIANDO VALIDAÇÕES ===');
    
    if (!user) {
      console.error('❌ Usuário não encontrado');
      return { isValid: false, errorMessage: 'Você precisa estar logado para contribuir' };
    }
    console.log('✅ Usuário verificado:', user.id);

    if (!formData.productName.trim()) {
      console.error('❌ Nome do produto vazio');
      return { isValid: false, errorMessage: 'Nome do produto é obrigatório' };
    }
    console.log('✅ Nome do produto válido:', formData.productName);

    if (!formData.storeName.trim()) {
      console.error('❌ Nome da loja vazio');
      return { isValid: false, errorMessage: 'Nome da loja é obrigatório' };
    }
    console.log('✅ Nome da loja válido:', formData.storeName);

    if (formData.price <= 0) {
      console.error('❌ Preço inválido:', formData.price);
      return { isValid: false, errorMessage: 'Preço deve ser maior que zero' };
    }
    console.log('✅ Preço válido:', formData.price);

    if (!formData.city.trim() || !formData.state.trim()) {
      console.error('❌ Localização inválida:', { city: formData.city, state: formData.state });
      return { isValid: false, errorMessage: 'Localização é obrigatória' };
    }
    console.log('✅ Localização válida:', formData.city, formData.state);

    console.log('✅ Todas as validações passaram!');
    return { isValid: true };
  };

  return { validateForm };
};
