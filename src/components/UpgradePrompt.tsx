import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Crown, Zap, TrendingUp } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { PLANS, PlanTier } from "@/lib/plans";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  suggestedPlan?: PlanTier;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  isOpen,
  onClose,
  feature,
  suggestedPlan = "premium",
}) => {
  const { createCheckout, isLoading } = useSubscription();
  const plan = PLANS.find((p) => p.id === suggestedPlan);

  const handleUpgrade = () => {
    createCheckout(suggestedPlan);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span>Recurso Premium</span>
          </DialogTitle>
          <DialogDescription>
            Você atingiu o limite do plano gratuito para:{" "}
            <strong>{feature}</strong>
          </DialogDescription>
        </DialogHeader>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span>Desbloqueie com {plan?.name}</span>
            </CardTitle>
            <CardDescription>
              A partir de R$ {plan?.price.toFixed(2).replace(".", ",")}/mês
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>Comparações ilimitadas</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>Relatórios detalhados</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>Alertas de preço</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Continuar Gratuito
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600"
          >
            {isLoading ? "Processando..." : "Fazer Upgrade"}
          </Button>
        </div>

        <div className="text-center">
          <Link
            to="/plans"
            className="text-sm text-blue-600 hover:underline"
            onClick={onClose}
          >
            Ver todos os planos
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};
