
import React, { createContext, useContext, ReactNode } from 'react';
import { PlanTier } from '@/lib/plans';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionContextType {
  currentPlan: PlanTier;
  isLoading: boolean;
  createCheckout: (planId: PlanTier) => Promise<void>;
  manageSubscription: () => Promise<void>;
  updateUserPlan: (planId: PlanTier) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();

  const currentPlan: PlanTier = profile?.plan || 'free';
  const isLoading = false; // Será usado quando implementarmos Stripe

  const createCheckout = async (planId: PlanTier) => {
    // TODO: Implementar integração com Stripe
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: `Checkout para o plano ${planId} será implementado em breve`,
    });
    console.log('Creating checkout for plan:', planId);
  };

  const manageSubscription = async () => {
    // TODO: Implementar portal do cliente Stripe
    toast({
      title: "Portal do cliente",
      description: "Portal de gerenciamento será implementado em breve",
    });
    console.log('Managing subscription');
  };

  const updateUserPlan = async (planId: PlanTier) => {
    const { error } = await updateProfile({ plan: planId });
    
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o plano",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Plano atualizado",
        description: `Seu plano foi atualizado para ${planId}`,
      });
    }
  };

  const value = {
    currentPlan,
    isLoading,
    createCheckout,
    manageSubscription,
    updateUserPlan,
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
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
