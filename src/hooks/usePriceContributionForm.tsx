// src/hooks/usePriceContributionForm.tsx (Depois)
import { useEffect } from 'react';
import { useForm } from 'react-hook-form'; // Importar useForm
import { zodResolver } from '@hookform/resolvers/zod'; // Importar zodResolver
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useFormValidation } from './price-contribution/useFormValidation'; // Onde está validateUser
import { useFormSubmission } from './price-contribution/useFormSubmission';
import { PriceContributionFormData, PriceContributionSchema } from '@/lib/types'; // Importar o schema e o tipo
import { toast } from 'sonner';

interface UsePriceContributionFormProps {
  onClose?: () => void;
}

export const usePriceContributionForm = (props?: UsePriceContributionFormProps) => {
  const { user, profile } = useAuth();
  const { city, state, loading: locationLoading } = useGeolocation();
  const { validateUser } = useFormValidation(); // Usar validateUser
  const { isSubmitting, submitContribution } = useFormSubmission(props);

  // 1. Configurar react-hook-form com Zod
  const form = useForm<PriceContributionFormData>({
    resolver: zodResolver(PriceContributionSchema),
    defaultValues: {
      productName: '',
      price: 0,
      storeName: '',
      city: '',
      state: '',
      userId: '', // Será preenchido no submit
      timestamp: new Date(), // Será preenchido no submit
      verified: false,
      quantity: 1,
      unit: 'unidade',
    },
    // Modo de validação (ex: ao blur, ao submit)
    mode: 'onBlur',
  });

  const { reset, setValue, formState: { errors } } = form; // Obter reset, setValue e errors do hook form

  // Atualizar dados de localização automaticamente no formulário
  useEffect(() => {
    console.log('=== ATUALIZANDO LOCALIZAÇÃO NO HOOK FORM ===');
    console.log('City:', city);
    console.log('State:', state);
    if (city && state) {
      setValue('city', city);
      setValue('state', state);
      console.log('Localização atualizada no formulário via setValue');
    }
  }, [city, state, setValue]); // Adicionar setValue como dependência

  // Resetar formulário (usado após submissão bem-sucedida)
  const resetForm = (currentCity: string, currentState: string) => {
    console.log('Resetando formulário via react-hook-form...');
    reset({
      productName: '',
      price: 0,
      storeName: '',
      city: currentCity,
      state: currentState,
      userId: '',
      timestamp: new Date(),
      verified: false,
      quantity: 1,
      unit: 'unidade',
    });
    console.log('Formulário resetado pelo react-hook-form');
  };


  // 2. Criar a função de submissão real para o react-hook-form
  const onSubmit = async (data: PriceContributionFormData) => {
    console.log('=== ONSUBMIT DO REACT-HOOK-FORM DISPARADO ===');
    console.log('Dados validados:', data);

    // Validação de usuário (ainda necessária, pois não é uma validação de dados do formulário em si)
    const userValidation = validateUser(user);
    if (!userValidation.isValid) {
      toast.error(userValidation.errorMessage!, { id: 'contribution-submit' });
      return;
    }

    // Chamar a lógica de submissão principal
    await submitContribution(
      { ...data, userId: user!.id, timestamp: new Date() }, // Garantir userId e timestamp
      user!,
      profile,
      resetForm, // Passar o novo resetForm
      city,
      state
    );
  };

  return {
    form, // Expor o objeto form completo do react-hook-form
    isSubmitting,
    handleSubmit: form.handleSubmit(onSubmit), // Usar o handleSubmit do react-hook-form
    locationLoading,
  };
};
