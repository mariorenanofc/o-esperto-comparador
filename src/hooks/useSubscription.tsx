
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser } from '@clerk/clerk-react';
import { PlanTier, getPlanById } from '@/lib/plans';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionContextType {
  currentPlan: PlanTier;
  isLoading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckout: (planId: PlanTier) => Promise<void>;
  manageSubscription: () => Promise<void>;
  canUseFeature: (feature: string, currentUsage: number) => boolean;
  getRemainingUsage: (feature: string, currentUsage: number) => number;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState<PlanTier>('free');
  const [isLoading, setIsLoading] = useState(false);

  const checkSubscription = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Aqui vamos integrar com a API do Stripe via Supabase Edge Functions
      // Por enquanto, vamos usar localStorage para simulação
      const savedPlan = localStorage.getItem(`user_plan_${user.id}`) as PlanTier;
      if (savedPlan && ['free', 'premium', 'pro', 'empresarial'].includes(savedPlan)) {
        setCurrentPlan(savedPlan);
      }
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar sua assinatura.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCheckout = async (planId: PlanTier) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para assinar um plano.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Aqui vamos integrar com Stripe Checkout via Supabase Edge Functions
      // Por enquanto, vamos simular o sucesso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem(`user_plan_${user.id}`, planId);
      setCurrentPlan(planId);
      
      toast({
        title: "Sucesso!",
        description: `Você agora tem o plano ${getPlanById(planId).name}!`,
      });
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar o pagamento.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const manageSubscription = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Aqui vamos integrar com Stripe Customer Portal
      // Por enquanto, vamos simular
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Portal do cliente",
        description: "Redirecionando para gerenciar sua assinatura...",
      });
    } catch (error) {
      console.error('Erro ao acessar portal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar o portal de gerenciamento.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canUseFeature = (feature: string, currentUsage: number): boolean => {
    const plan = getPlanById(currentPlan);
    const limit = plan.limitations[feature as keyof typeof plan.limitations];
    
    if (limit === -1) return true;
    return currentUsage < limit;
  };

  const getRemainingUsage = (feature: string, currentUsage: number): number => {
    const plan = getPlanById(currentPlan);
    const limit = plan.limitations[feature as keyof typeof plan.limitations];
    
    if (limit === -1) return -1; // Ilimitado
    return Math.max(0, limit - currentUsage);
  };

  useEffect(() => {
    if (isLoaded && user) {
      checkSubscription();
    }
  }, [isLoaded, user]);

  return (
    <SubscriptionContext.Provider
      value={{
        currentPlan,
        isLoading,
        checkSubscription,
        createCheckout,
        manageSubscription,
        canUseFeature,
        getRemainingUsage,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription deve ser usado dentro de SubscriptionProvider');
  }
  return context;
};
