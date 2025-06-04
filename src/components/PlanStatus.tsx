
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Settings, TrendingUp } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { getPlanById } from "@/lib/plans";
import { Link } from "react-router-dom";

interface PlanStatusProps {
  currentUsage?: {
    comparisons: number;
    savedComparisons: number;
    priceAlerts: number;
  };
}

export const PlanStatus: React.FC<PlanStatusProps> = ({ 
  currentUsage = { comparisons: 0, savedComparisons: 0, priceAlerts: 0 } 
}) => {
  const { currentPlan, manageSubscription, isLoading } = useSubscription();
  const plan = getPlanById(currentPlan);

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Ilimitado
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span>Plano {plan.name}</span>
          </CardTitle>
          <CardDescription>
            {plan.price > 0 ? `R$ ${plan.price.toFixed(2).replace('.', ',')}/mês` : 'Gratuito'}
          </CardDescription>
        </div>
        <Badge variant={currentPlan === 'free' ? 'secondary' : 'default'}>
          {currentPlan === 'free' ? 'Gratuito' : 'Premium'}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Comparações */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Comparações este mês</span>
            <span>
              {currentUsage.comparisons}/{plan.limitations.comparisonsPerMonth === -1 ? '∞' : plan.limitations.comparisonsPerMonth}
            </span>
          </div>
          {plan.limitations.comparisonsPerMonth !== -1 && (
            <Progress 
              value={getUsagePercentage(currentUsage.comparisons, plan.limitations.comparisonsPerMonth)}
              className="h-2"
            />
          )}
        </div>

        {/* Comparações Salvas */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Comparações salvas</span>
            <span>
              {currentUsage.savedComparisons}/{plan.limitations.savedComparisons === -1 ? '∞' : plan.limitations.savedComparisons}
            </span>
          </div>
          {plan.limitations.savedComparisons !== -1 && (
            <Progress 
              value={getUsagePercentage(currentUsage.savedComparisons, plan.limitations.savedComparisons)}
              className="h-2"
            />
          )}
        </div>

        {/* Alertas de Preço */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Alertas de preço</span>
            <span>
              {currentUsage.priceAlerts}/{plan.limitations.priceAlerts === -1 ? '∞' : plan.limitations.priceAlerts}
            </span>
          </div>
          {plan.limitations.priceAlerts !== -1 && (
            <Progress 
              value={getUsagePercentage(currentUsage.priceAlerts, plan.limitations.priceAlerts)}
              className="h-2"
            />
          )}
        </div>

        <div className="flex space-x-2 pt-2">
          {currentPlan !== 'free' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={manageSubscription}
              disabled={isLoading}
              className="flex-1"
            >
              <Settings className="w-4 h-4 mr-2" />
              Gerenciar
            </Button>
          ) : (
            <Link to="/plans" className="flex-1">
              <Button size="sm" className="w-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                Fazer Upgrade
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
