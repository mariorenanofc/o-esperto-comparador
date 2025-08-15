import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, CreditCard } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SubscriptionExpiryAlert: React.FC = () => {
  const { currentPlan, manageSubscription } = useSubscription();
  const { user } = useAuth();
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const checkSubscriptionExpiry = async () => {
      if (!user || currentPlan === "free" || currentPlan === "admin") return;

      try {
        const { data, error } = await supabase
          .from('subscribers')
          .select('subscription_end')
          .eq('user_id', user.id)
          .single();

        if (error || !data?.subscription_end) return;

        const endDate = new Date(data.subscription_end);
        const now = new Date();
        const timeDiff = endDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        setSubscriptionEnd(data.subscription_end);
        setDaysUntilExpiry(daysDiff);

        // Mostrar alerta se faltam 7 dias ou menos para vencer
        setShowAlert(daysDiff <= 7 && daysDiff > 0);
      } catch (error) {
        console.error('Erro ao verificar expiração:', error);
      }
    };

    checkSubscriptionExpiry();
    const interval = setInterval(checkSubscriptionExpiry, 24 * 60 * 60 * 1000); // Check diariamente

    return () => clearInterval(interval);
  }, [user, currentPlan]);

  const handleRenewSubscription = () => {
    manageSubscription();
    toast.success("Redirecionando para gerenciar sua assinatura...");
  };

  if (!showAlert || !daysUntilExpiry) return null;

  return (
    <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 mb-6">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-amber-800 dark:text-amber-200 font-medium mb-2">
            ⚠️ Seu plano {currentPlan} expira em {daysUntilExpiry} {daysUntilExpiry === 1 ? 'dia' : 'dias'}!
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            Data de vencimento: {new Date(subscriptionEnd!).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <Button 
          onClick={handleRenewSubscription}
          className="ml-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
          size="sm"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Renovar Plano
        </Button>
      </AlertDescription>
    </Alert>
  );
};