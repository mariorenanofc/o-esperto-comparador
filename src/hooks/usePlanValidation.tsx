import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { canUseFeature, PlanTier } from "@/lib/plans";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";

interface PlanValidationHook {
  currentPlan: PlanTier;
  canUseFeature: (feature: string, currentUsage?: number) => boolean;
  validateFeatureAccess: (feature: string, currentUsage?: number) => Promise<boolean>;
  incrementUsageCounter: (feature: string) => Promise<void>;
}

export const usePlanValidation = (): PlanValidationHook => {
  const { profile } = useAuth();
  const { currentPlan } = useSubscription();

  const validateFeatureAccess = useCallback(async (feature: string, currentUsage: number = 0): Promise<boolean> => {
    // Verificação no banco de dados via função segura
    try {
      const { data, error } = await supabase.rpc('check_user_feature_access', {
        feature_name: feature,
        current_usage: currentUsage
      });

      if (error) {
        console.error('Erro ao verificar acesso à funcionalidade:', error);
        // Em caso de erro, usar validação local como fallback
        return canUseFeature(currentPlan, feature as any, currentUsage);
      }

      return data === true;
    } catch (error) {
      console.error('Erro na validação de funcionalidade:', error);
      // Fallback para validação local
      return canUseFeature(currentPlan, feature as any, currentUsage);
    }
  }, [currentPlan]);

  const incrementUsageCounter = useCallback(async (feature: string): Promise<void> => {
    if (!profile) return;

    try {
      if (feature === 'comparisonsPerMonth') {
        await supabase
          .from('profiles')
          .update({
            comparisons_made_this_month: (profile.comparisons_made_this_month || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);
      }
    } catch (error) {
      console.error('Erro ao incrementar contador de uso:', error);
    }
  }, [profile]);

  const checkFeatureAccess = useCallback((feature: string, currentUsage: number = 0): boolean => {
    return canUseFeature(currentPlan, feature as any, currentUsage);
  }, [currentPlan]);

  return {
    currentPlan,
    canUseFeature: checkFeatureAccess,
    validateFeatureAccess,
    incrementUsageCounter
  };
};