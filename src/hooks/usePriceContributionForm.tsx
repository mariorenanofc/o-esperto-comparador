
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useFormValidation } from './price-contribution/useFormValidation';
import { useFormState } from './price-contribution/useFormState';
import { useFormSubmission } from './price-contribution/useFormSubmission';
import { toast } from 'sonner';

interface UsePriceContributionFormProps {
  onClose?: () => void;
}

export const usePriceContributionForm = (props?: UsePriceContributionFormProps) => {
  const { user, profile } = useAuth();
  const { city, state, loading: locationLoading } = useGeolocation();
  const { validateForm } = useFormValidation();
  const { formData, setFormData, resetForm } = useFormState({ city, state });
  const { isSubmitting, submitContribution } = useFormSubmission(props);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== EVENTO DE SUBMIT DISPARADO ===');
    console.log('Event:', e);
    console.log('Event type:', e.type);
    console.log('Event target:', e.target);
    
    // Validações básicas
    const validation = validateForm(formData, user);
    if (!validation.isValid) {
      toast.error(validation.errorMessage!, { id: 'contribution-submit' });
      return;
    }

    // Submeter contribuição
    await submitContribution(formData, user!, profile, resetForm, city, state);
  };

  return {
    isSubmitting,
    formData,
    setFormData,
    handleSubmit,
    locationLoading,
  };
};
