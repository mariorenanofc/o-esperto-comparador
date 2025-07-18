import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Settings, TrendingUp } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { getPlanById } from "@/lib/plans";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { comparisonService } from "@/services/comparisonService";
import { useEffect, useState } from "react";

export const PlanStatus: React.FC<PlanStatusProps> = () => {
  const { user, profile } = useAuth(); // Linha 23 (no meu contexto)
  const { currentPlan, manageSubscription, isLoading } = useSubscription();
  const plan = getPlanById(currentPlan);

  const [userCurrentUsage, setUserCurrentUsage] = useState({
    comparisonsMade: 0,
    savedComparisons: 0,
    priceAlerts: 0,
  });
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    const fetchUserUsage = async () => {
      if (!user) {
        setLoadingUsage(false);
        return;
      }
      setLoadingUsage(true);
      try {
        // profile?.comparisons_made_this_month está OK após a correção em useAuth.tsx
        const comparisonsMade = profile?.comparisons_made_this_month || 0;
        const savedComparisonsList = await comparisonService.getUserComparisons(
          user.id
        );

        setUserCurrentUsage({
          comparisonsMade: comparisonsMade,
          savedComparisons: savedComparisonsList.length,
          priceAlerts: 0, // Alertas de preço ainda não são rastreados no banco, manter 0
        });
      } catch (error) {
        console.error("Erro ao carregar uso do usuário:", error);
      } finally {
        setLoadingUsage(false);
      }
    };

    fetchUserUsage();
    const interval = setInterval(fetchUserUsage, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, profile, currentPlan]); // Depende de user, profile e currentPlan

  const getUsagePercentage = (current: number, limit: number | undefined) => {
    if (limit === -1 || limit === undefined || limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  if (loadingUsage || isLoading) {
    return (
      <Card className="dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-xl">Carregando Plano...</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={50} className="h-2 animate-pulse" />
          <p className="text-sm text-gray-500 mt-2">
            Buscando detalhes do seu plano e uso.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span>Plano {plan.name}</span>
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            {plan.price > 0
              ? `R$ ${plan.price.toFixed(2).replace(".", ",")}/mês`
              : "Gratuito"}
          </CardDescription>
        </div>
        <Badge
          variant={currentPlan === "free" ? "secondary" : "default"}
          className="dark:bg-gray-700 dark:text-gray-200"
        >
          {currentPlan === "free" ? "Gratuito" : "Premium"}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Comparações Feitas (comparisonsPerMonth) */}
        <div>
          <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
            <span>Comparações feitas este mês</span>
            <span>
              {userCurrentUsage.comparisonsMade}/
              {plan.limitations.comparisonsPerMonth === -1
                ? "∞"
                : plan.limitations.comparisonsPerMonth}
            </span>
          </div>
          {plan.limitations.comparisonsPerMonth !== -1 && (
            <Progress
              value={getUsagePercentage(
                userCurrentUsage.comparisonsMade,
                plan.limitations.comparisonsPerMonth
              )}
              className="h-2"
            />
          )}
        </div>

        {/* Comparações Salvas (savedComparisons) */}
        <div>
          <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
            <span>Comparações salvas (histórico)</span>
            <span>
              {userCurrentUsage.savedComparisons}/
              {plan.limitations.savedComparisons === -1
                ? "∞"
                : plan.limitations.savedComparisons}
            </span>
          </div>
          {plan.limitations.savedComparisons !== -1 && (
            <Progress
              value={getUsagePercentage(
                userCurrentUsage.savedComparisons,
                plan.limitations.savedComparisons
              )}
              className="h-2"
            />
          )}
        </div>

        {/* Alertas de Preço (priceAlerts) */}
        <div>
          <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
            <span>Alertas de preço</span>
            <span>
              {userCurrentUsage.priceAlerts}/
              {plan.limitations.priceAlerts === -1
                ? "∞"
                : plan.limitations.priceAlerts}
            </span>
          </div>
          {plan.limitations.priceAlerts !== -1 && (
            <Progress
              value={getUsagePercentage(
                userCurrentUsage.priceAlerts,
                plan.limitations.priceAlerts
              )}
              className="h-2"
            />
          )}
        </div>

        {/* Ofertas Diárias Visíveis (dailyOffersVisible) */}
        {plan.limitations.dailyOffersVisible !== Infinity && ( // Apenas mostra se houver limite ou não for Pro/Premium ilimitado
          <div>
            <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
              <span>Ofertas diárias visíveis</span>
              <span>
                {plan.limitations.dailyOffersVisible === -1
                  ? "Todas"
                  : plan.limitations.dailyOffersVisible || 0}{" "}
                / Total na cidade
              </span>
            </div>
            {/* Não há progresso aqui, pois é um limite fixo para visualização */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Você vê até{" "}
              {plan.limitations.dailyOffersVisible === -1
                ? "todas"
                : plan.limitations.dailyOffersVisible || 0}{" "}
              ofertas diárias em sua cidade.
            </p>
          </div>
        )}

        <div className="flex space-x-2 pt-2">
          {currentPlan !== "free" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={manageSubscription}
              disabled={isLoading}
              className="flex-1 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Gerenciar
            </Button>
          ) : (
            <Link to="/plans" className="flex-1">
              <Button
                size="sm"
                className="w-full bg-app-green hover:bg-green-600 dark:bg-app-green dark:hover:bg-green-700 dark:text-white"
              >
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
