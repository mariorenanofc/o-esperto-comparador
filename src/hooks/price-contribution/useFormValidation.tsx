
import { PriceContribution } from '@/lib/types';
import { User } from '@supabase/supabase-js';

export const useFormValidation = () => {
  const validateForm = (
    formData: PriceContribution,
    user: User | null
  ): { isValid: boolean; errorMessage?: string } => {
    console.log('=== INICIANDO VALIDAÇÕES ===');
    
    // Validação de usuário
    if (!user) {
      console.error('❌ Usuário não encontrado');
      return { isValid: false, errorMessage: 'Você precisa estar logado para contribuir' };
    }
    console.log('✅ Usuário verificado:', user.id);

    // Validação de produto (mais robusta)
    if (!formData.productName || typeof formData.productName !== 'string' || !formData.productName.trim()) {
      console.error('❌ Nome do produto inválido');
      return { isValid: false, errorMessage: 'Nome do produto é obrigatório e deve ter pelo menos 2 caracteres' };
    }
    
    if (formData.productName.trim().length < 2) {
      console.error('❌ Nome do produto muito curto');
      return { isValid: false, errorMessage: 'Nome do produto deve ter pelo menos 2 caracteres' };
    }
    
    // Verificar caracteres especiais perigosos
    if (/[<>\"\'&]/.test(formData.productName)) {
      console.error('❌ Nome do produto contém caracteres inválidos');
      return { isValid: false, errorMessage: 'Nome do produto contém caracteres não permitidos' };
    }
    console.log('✅ Nome do produto válido:', formData.productName);

    // Validação de loja (mais robusta)
    if (!formData.storeName || typeof formData.storeName !== 'string' || !formData.storeName.trim()) {
      console.error('❌ Nome da loja inválido');
      return { isValid: false, errorMessage: 'Nome da loja é obrigatório e deve ter pelo menos 2 caracteres' };
    }
    
    if (formData.storeName.trim().length < 2) {
      console.error('❌ Nome da loja muito curto');
      return { isValid: false, errorMessage: 'Nome da loja deve ter pelo menos 2 caracteres' };
    }
    
    if (/[<>\"\'&]/.test(formData.storeName)) {
      console.error('❌ Nome da loja contém caracteres inválidos');
      return { isValid: false, errorMessage: 'Nome da loja contém caracteres não permitidos' };
    }
    console.log('✅ Nome da loja válido:', formData.storeName);

    // Validação de preço (mais robusta)
    if (!formData.price || typeof formData.price !== 'number' || isNaN(formData.price) || formData.price <= 0) {
      console.error('❌ Preço inválido:', formData.price);
      return { isValid: false, errorMessage: 'Preço deve ser um número válido maior que zero' };
    }
    
    if (formData.price > 999999) {
      console.error('❌ Preço muito alto:', formData.price);
      return { isValid: false, errorMessage: 'Preço não pode ser maior que R$ 999.999,00' };
    }
    
    if (formData.price < 0.01) {
      console.error('❌ Preço muito baixo:', formData.price);
      return { isValid: false, errorMessage: 'Preço deve ser pelo menos R$ 0,01' };
    }
    console.log('✅ Preço válido:', formData.price);

    // Validação de localização (mais robusta)
    if (!formData.city || !formData.state || 
        typeof formData.city !== 'string' || typeof formData.state !== 'string' ||
        !formData.city.trim() || !formData.state.trim()) {
      console.error('❌ Localização inválida:', { city: formData.city, state: formData.state });
      return { isValid: false, errorMessage: 'Cidade e estado são obrigatórios' };
    }
    
    if (formData.city.trim().length < 2 || formData.state.trim().length < 2) {
      console.error('❌ Localização muito curta');
      return { isValid: false, errorMessage: 'Cidade e estado devem ter pelo menos 2 caracteres cada' };
    }
    
    if (/[<>\"\'&]/.test(formData.city) || /[<>\"\'&]/.test(formData.state)) {
      console.error('❌ Localização contém caracteres inválidos');
      return { isValid: false, errorMessage: 'Cidade e estado contêm caracteres não permitidos' };
    }
    console.log('✅ Localização válida:', formData.city, formData.state);

    // Validação de quantidade e unidade
    if (formData.quantity && (typeof formData.quantity !== 'number' || formData.quantity < 1 || formData.quantity > 1000)) {
      console.error('❌ Quantidade inválida:', formData.quantity);
      return { isValid: false, errorMessage: 'Quantidade deve ser um número entre 1 e 1000' };
    }
    
    if (formData.unit && typeof formData.unit !== 'string') {
      console.error('❌ Unidade inválida:', formData.unit);
      return { isValid: false, errorMessage: 'Unidade deve ser um texto válido' };
    }

    console.log('✅ Todas as validações passaram!');
    return { isValid: true };
  };

  return { validateForm };
};
