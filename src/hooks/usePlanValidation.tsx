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
    // Admin tem acesso ilimitado
    if (profile?.plan === "admin") {
      return true;
    }

    // Verificar se o plano está expirado (exceto free e admin)
    if (currentPlan !== "free") {
      try {
        const { data: subscriber, error } = await supabase
          .from('subscribers')
          .select('subscription_end, subscribed')
          .eq('user_id', profile?.id)
          .single();

        if (error || !subscriber) {
          console.error('Erro ao verificar status da assinatura:', error);
          // Se não conseguir verificar, bloquear acesso por segurança
          return canUseFeature("free", feature as any, currentUsage);
        }

        // Se a assinatura expirou ou não está ativa, usar limites do plano gratuito
        if (!subscriber.subscribed || 
            (subscriber.subscription_end && new Date(subscriber.subscription_end) < new Date())) {
          console.log('Assinatura expirada ou inativa, aplicando limites do plano gratuito');
          return canUseFeature("free", feature as any, currentUsage);
        }
      } catch (error) {
        console.error('Erro na verificação de expiração:', error);
        return canUseFeature("free", feature as any, currentUsage);
      }
    }

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
  }, [currentPlan, profile]);

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
    // Admin tem acesso ilimitado
    if (profile?.plan === "admin") {
      return true;
    }
    
    // Para validação local simples, usar o plano atual
    // A validação de expiração será feita na função validateFeatureAccess
    return canUseFeature(currentPlan, feature as any, currentUsage);
  }, [currentPlan]);

  return {
    currentPlan,
    canUseFeature: checkFeatureAccess,
    validateFeatureAccess,
    incrementUsageCounter
  };
};