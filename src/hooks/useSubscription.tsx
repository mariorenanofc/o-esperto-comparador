import React, { createContext, useContext, ReactNode } from "react";
import { PlanTier } from "@/lib/plans";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface SubscriptionContextType {
  currentPlan: PlanTier;
  isLoading: boolean;
  createCheckout: (planId: PlanTier) => Promise<void>;
  manageSubscription: () => Promise<void>;
  updateUserPlan: (planId: PlanTier) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { profile, updateProfile } = useAuth();

  // Safely cast profile.plan to PlanTier with fallback
  const currentPlan: PlanTier = (profile?.plan as PlanTier) || "free";
  const isLoading = false; // Será usado quando implementarmos Stripe

  const createCheckout = async (planId: PlanTier) => {
    // TODO: Implementar integração com Stripe
    toast.info(`Checkout para o plano ${planId} será implementado em breve`);
    console.log("Creating checkout for plan:", planId);
  };

  const manageSubscription = async () => {
    // TODO: Implementar portal do cliente Stripe
    toast.info("Portal de gerenciamento será implementado em breve");
    console.log("Managing subscription");
  };

  const updateUserPlan = async (planId: PlanTier) => {
    const { error } = await updateProfile({ plan: planId });

    if (error) {
      toast.error("Não foi possível atualizar o plano");
    } else {
      toast.success(`Seu plano foi atualizado para ${planId}`);
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
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
}
