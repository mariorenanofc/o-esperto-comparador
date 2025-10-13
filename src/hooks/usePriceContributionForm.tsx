import { useAuth } from '@/hooks/useAuth';
import { useRateLimit } from '@/hooks/useRateLimit';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useFormValidation } from './price-contribution/useFormValidation';
import { useFormState } from './price-contribution/useFormState';
import { useFormSubmission } from './price-contribution/useFormSubmission';
import { toast } from 'sonner';
import { analytics } from '@/lib/analytics';
import { errorHandler } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';

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
    
    logger.info('Price contribution form submitted', { 
      productName: formData.productName,
      storeName: formData.storeName
    });
    
    // Check rate limit first
    const allowed = await checkRateLimit('price_contribution', {
      maxAttempts: 5,
      windowMinutes: 60,
      blockMinutes: 30
    });

    if (!allowed) {
      logger.warn('Price contribution rate limited', { userId: user?.id });
      return; // Rate limit toast is shown by the hook
    }
    
    // Validações básicas
    const validation = validateForm(formData, user);
    if (!validation.isValid) {
      toast.error(validation.errorMessage!, { id: 'contribution-submit' });
      logger.warn('Price contribution validation failed', { 
        errorMessage: validation.errorMessage,
        formData: {
          productName: formData.productName,
          storeName: formData.storeName
        }
      });
      return;
    }

    // Submeter contribuição
    const startTime = Date.now();
    
    await errorHandler.handleAsync(
      async () => {
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
        
        logger.info('Price contribution submitted successfully', {
          productName: formData.productName,
          storeName: formData.storeName,
          city,
          state
        });
      },
      { 
        component: 'usePriceContributionForm', 
        action: 'handleSubmit',
        userId: user?.id,
        metadata: {
          productName: formData.productName,
          storeName: formData.storeName
        }
      }
    );
  };

  return {
    isSubmitting,
    formData,
    setFormData,
    handleSubmit,
    locationLoading,
  };
};
