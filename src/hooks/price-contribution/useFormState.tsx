
import { useState, useEffect } from 'react';
import { PriceContribution } from '@/lib/types';

interface UseFormStateProps {
  city: string;
  state: string;
}

export const useFormState = ({ city, state }: UseFormStateProps) => {
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
  // Só atualiza se houver valores válidos (não vazios)
  useEffect(() => {
    if (city && city.trim() !== '' && state && state.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        city,
        state
      }));
    }
  }, [city, state]);

  const resetForm = (currentCity: string, currentState: string) => {
    console.log('Resetando formulário...');
    setFormData({
      productName: '',
      price: 0,
      storeName: '',
      city: currentCity || '',
      state: currentState || '',
      userId: '',
      timestamp: new Date(),
      verified: false,
      quantity: 1,
      unit: 'unidade'
    });
    console.log('Formulário resetado');
  };

  return {
    formData,
    setFormData,
    resetForm
  };
};
