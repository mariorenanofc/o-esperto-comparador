import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { PlanTier } from "@/lib/plans";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { errorHandler } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';

interface SubscriptionContextType {
  currentPlan: PlanTier;
  isLoading: boolean;
  createCheckout: (planId: PlanTier) => Promise<void>;
  createMercadoPagoCheckout: (planId: PlanTier) => Promise<void>;
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
    
    setIsLoading(true);
    
    await errorHandler.retry(
      async () => {
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (error) throw error;

        if (data?.subscription_tier && data.subscription_tier !== currentPlan) {
          await updateProfile({ plan: data.subscription_tier });
          logger.info('Subscription tier updated', { 
            oldPlan: currentPlan, 
            newPlan: data.subscription_tier 
          });
        }
      },
      3, // 3 retry attempts
      2000, // 2s delay
      { 
        component: 'useSubscription', 
        action: 'checkSubscription', 
        userId: user.id 
      }
    ).finally(() => {
      setIsLoading(false);
    });
  };

  const createCheckout = async (planId: PlanTier) => {
    if (!user) {
      toast.error("Você precisa estar logado para assinar um plano");
      return;
    }

    setIsLoading(true);
    
    await errorHandler.retry(
      async () => {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { planId }
        });

        if (error) throw new Error(error.message || 'Erro ao criar checkout');

        if (data?.url) {
          window.open(data.url, '_blank');
          logger.info('Checkout created', { planId, userId: user.id });
        } else {
          throw new Error("Nenhuma URL de checkout foi retornada");
        }
      },
      2, // 2 retry attempts
      3000, // 3s delay
      { 
        component: 'useSubscription', 
        action: 'createCheckout',
        userId: user.id,
        metadata: { planId }
      }
    ).finally(() => {
      setIsLoading(false);
    });
  };

  const createMercadoPagoCheckout = async (planId: PlanTier) => {
    if (!user) {
      toast.error("Você precisa estar logado para assinar um plano");
      return;
    }

    setIsLoading(true);
    
    await errorHandler.retry(
      async () => {
        const { data, error } = await supabase.functions.invoke('create-mp-checkout', {
          body: { planId }
        });

        if (error) throw new Error(error.message || 'Erro ao criar checkout do Mercado Pago');

        if (data?.url) {
          window.open(data.url, '_blank');
          logger.info('Mercado Pago checkout created', { planId, userId: user.id });
        } else {
          throw new Error("Nenhuma URL de checkout foi retornada");
        }
      },
      2,
      3000,
      { 
        component: 'useSubscription', 
        action: 'createMercadoPagoCheckout',
        userId: user.id,
        metadata: { planId }
      }
    ).finally(() => {
      setIsLoading(false);
    });
  };

  const manageSubscription = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    setIsLoading(true);
    
    await errorHandler.retry(
      async () => {
        const { data, error } = await supabase.functions.invoke('customer-portal');

        if (error) throw new Error('Erro ao abrir portal de gerenciamento');

        if (data?.url) {
          window.open(data.url, '_blank');
          logger.info('Customer portal opened', { userId: user.id });
        }
      },
      2, // 2 retry attempts
      2000, // 2s delay
      { 
        component: 'useSubscription', 
        action: 'manageSubscription',
        userId: user.id 
      }
    ).finally(() => {
      setIsLoading(false);
    });
  };

  const updateUserPlan = async (planId: PlanTier) => {
    await errorHandler.handleAsync(
      async () => {
        const { error } = await updateProfile({ plan: planId });

        if (error) throw new Error('Não foi possível atualizar o plano');

        toast.success(`Seu plano foi atualizado para ${planId}`);
        logger.info('User plan updated', { planId, userId: user?.id });
      },
      { 
        component: 'useSubscription', 
        action: 'updateUserPlan',
        userId: user?.id,
        metadata: { planId }
      }
    );
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
    createMercadoPagoCheckout,
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
