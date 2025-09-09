
import { useAuth } from '@/hooks/useAuth';
import { useRateLimit } from '@/hooks/useRateLimit';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useFormValidation } from './price-contribution/useFormValidation';
import { useFormState } from './price-contribution/useFormState';
import { useFormSubmission } from './price-contribution/useFormSubmission';
import { toast } from 'sonner';
import { analytics } from '@/lib/analytics';

interface UsePriceContributionFormProps {
  onClose?: () => void;
}

export const usePriceContributionForm = (props?: UsePriceContributionFormProps) => {
  const { user, profile } = useAuth();
  const { city, state, loading: locationLoading } = useGeolocation();
  const { checkRateLimit } = useRateLimit();
  const { validateForm } = useFormValidation();
  const { formData, setFormData, resetForm } = useFormState({ city, state });
  const { isSubmitting, submitContribution } = useFormSubmission(props);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== EVENTO DE SUBMIT DISPARADO ===');
    console.log('Event:', e);
    console.log('Event type:', e.type);
    console.log('Event target:', e.target);
    
    // Check rate limit first
    const allowed = await checkRateLimit('price_contribution', {
      maxAttempts: 5,
      windowMinutes: 60,
      blockMinutes: 30
    });

    if (!allowed) {
      return; // Rate limit toast is shown by the hook
    }
    
    // Validações básicas
    const validation = validateForm(formData, user);
    if (!validation.isValid) {
      toast.error(validation.errorMessage!, { id: 'contribution-submit' });
      return;
    }

    // Submeter contribuição
    const startTime = Date.now();
    try {
      await submitContribution(formData, user!, profile, resetForm, city, state);
      
      // Track successful contribution
      await analytics.trackContribution({
        productName: formData.productName,
        storeName: formData.storeName,
        price: formData.price,
        city: city || 'unknown',
        state: state || 'unknown',
        timeMs: Date.now() - startTime
      });
    } catch (error) {
      await analytics.trackError(error as Error, { 
        context: 'price_contribution',
        formData: {
          productName: formData.productName,
          storeName: formData.storeName,
          price: formData.price
        }
      });
      throw error;
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
