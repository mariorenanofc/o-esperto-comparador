import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { PlanTier } from "@/lib/plans";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionContextType {
  currentPlan: PlanTier;
  isLoading: boolean;
  createCheckout: (planId: PlanTier) => Promise<void>;
  manageSubscription: () => Promise<void>;
  updateUserPlan: (planId: PlanTier) => Promise<void>;
  checkSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { profile, updateProfile, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Safely cast profile.plan to PlanTier with fallback
  const currentPlan: PlanTier = (profile?.plan as PlanTier) || "free";

  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      if (data?.subscription_tier && data.subscription_tier !== currentPlan) {
        await updateProfile({ plan: data.subscription_tier });
      }
    } catch (error) {
      console.error('Error in checkSubscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCheckout = async (planId: PlanTier) => {
    if (!user) {
      toast.error("Você precisa estar logado para assinar um plano");
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId }
      });

      if (error) {
        toast.error("Erro ao criar checkout");
        console.error('Checkout error:', error);
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast.error("Erro ao processar pagamento");
      console.error('Error in createCheckout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const manageSubscription = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        toast.error("Erro ao abrir portal de gerenciamento");
        console.error('Portal error:', error);
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast.error("Erro ao abrir portal");
      console.error('Error in manageSubscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPlan = async (planId: PlanTier) => {
    const { error } = await updateProfile({ plan: planId });

    if (error) {
      toast.error("Não foi possível atualizar o plano");
    } else {
      toast.success(`Seu plano foi atualizado para ${planId}`);
    }
  };

  // Check subscription on mount and when user changes
  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  const value = {
    currentPlan,
    isLoading,
    createCheckout,
    manageSubscription,
    updateUserPlan,
    checkSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
}
