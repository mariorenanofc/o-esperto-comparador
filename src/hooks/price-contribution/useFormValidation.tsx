// src/hooks/price-contribution/useFormValidation.tsx (Depois)
import { User } from '@supabase/supabase-js';

export const useFormValidation = () => {
  // A validação de dados do formulário será feita pelo Zod.
  // Este hook agora foca apenas na validação do usuário.
  const validateUser = (
    user: User | null
  ): { isValid: boolean; errorMessage?: string } => {
    console.log('=== VALIDAÇÃO DE USUÁRIO ===');
    if (!user) {
      console.error('❌ Usuário não encontrado');
      return { isValid: false, errorMessage: 'Você precisa estar logado para contribuir.' };
    }
    console.log('✅ Usuário verificado:', user.id);
    return { isValid: true };
  };

  return { validateUser }; // Retorna validateUser em vez de validateForm
};
