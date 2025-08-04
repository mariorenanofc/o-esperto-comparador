import React, { useState, useEffect, useCallback } from "react";
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
import { Crown, Settings, TrendingUp, Zap, Target, Bell, Eye, Sparkles, Star } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { getPlanById } from "@/lib/plans";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { comparisonService } from "@/services/comparisonService";

export const PlanStatus: React.FC<any> = () => {
  // Ajuste 'any' para o tipo correto se houver PlanStatusProps
  const { user, profile } = useAuth();
  const { currentPlan, manageSubscription, isLoading } = useSubscription();
  const plan = getPlanById(currentPlan);

  const [userCurrentUsage, setUserCurrentUsage] = useState({
    comparisonsMade: 0,
    savedComparisons: 0,
    priceAlerts: 0, // Mantenha este valor como 0
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
        const comparisonsMade = profile?.comparisons_made_this_month || 0;
        const savedComparisonsList = await comparisonService.getUserComparisons(
          user.id
        );
        // Remova a linha abaixo:
        // const activePriceAlerts = await priceAlertService.getUserPriceAlerts(user.id, 'active');

        setUserCurrentUsage({
          comparisonsMade: comparisonsMade,
          savedComparisons: savedComparisonsList.length,
          priceAlerts: 0, // Mantenha este valor como 0
        });
      } catch (error) {
        console.error("Erro ao carregar uso do usuário:", error);
      } finally {
        setLoadingUsage(false); // Era setLoadingUsage(false);
      }
    };

    fetchUserUsage();
    const interval = setInterval(fetchUserUsage, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, profile, currentPlan]);

  const getUsagePercentage = (current: number, limit: number | undefined) => {
    if (limit === -1 || limit === undefined || limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-gradient-to-r from-blue-500 to-purple-500";
  };

  const getUsageIcon = (type: string) => {
    switch (type) {
      case 'comparisons':
        return <Zap className="w-4 h-4" />;
      case 'saved':
        return <Target className="w-4 h-4" />;
      case 'alerts':
        return <Bell className="w-4 h-4" />;
      case 'offers':
        return <Eye className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  if (loadingUsage || isLoading) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-background/50 to-muted/30 backdrop-blur-sm border-0 shadow-2xl dark:shadow-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 animate-pulse" />
        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Carregando Plano...
          </CardTitle>
          <Sparkles className="w-6 h-6 text-primary animate-spin" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-4">
            <div className="h-3 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full animate-pulse" />
            <div className="h-2 bg-gradient-to-r from-muted to-muted/50 rounded-full animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground mt-4 animate-pulse">
            ✨ Buscando seus dados incríveis...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-muted/20 backdrop-blur-sm border border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] group">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-2xl animate-pulse delay-1000" />
      
      {/* Header */}
      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-sm animate-pulse" />
              <Crown className="relative w-8 h-8 text-yellow-500 drop-shadow-lg" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                Plano {plan.name}
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium">
                {plan.price > 0
                  ? `R$ ${plan.price.toFixed(2).replace(".", ",")}/mês`
                  : "✨ Gratuito"}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={currentPlan === "free" ? "outline" : "default"}
            className={`px-4 py-2 text-sm font-semibold shadow-lg ${
              currentPlan === "free" 
                ? "bg-gradient-to-r from-slate-500/10 to-slate-600/10 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600" 
                : "bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0 shadow-primary/25"
            }`}
          >
            {currentPlan === "free" ? (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                Gratuito
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Premium
              </div>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        {/* Usage Stats */}
        <div className="grid gap-4">
          {/* Comparações Feitas */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 border border-blue-200/30 dark:border-blue-800/30 hover:shadow-lg transition-all duration-300 group/item">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                  {getUsageIcon('comparisons')}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Comparações este mês</h4>
                  <p className="text-xs text-muted-foreground">Pesquisas realizadas</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {userCurrentUsage.comparisonsMade}
                </div>
                <div className="text-xs text-muted-foreground">
                  de {plan.limitations.comparisonsPerMonth === -1 ? "∞" : plan.limitations.comparisonsPerMonth}
                </div>
              </div>
            </div>
            {plan.limitations.comparisonsPerMonth !== -1 && (
              <div className="relative">
                <Progress
                  value={getUsagePercentage(userCurrentUsage.comparisonsMade, plan.limitations.comparisonsPerMonth)}
                  className="h-3 bg-blue-100 dark:bg-blue-900/30"
                />
              </div>
            )}
          </div>

          {/* Comparações Salvas */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-green-50/50 to-green-100/30 dark:from-green-950/20 dark:to-green-900/10 border border-green-200/30 dark:border-green-800/30 hover:shadow-lg transition-all duration-300 group/item">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                  {getUsageIcon('saved')}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Histórico salvo</h4>
                  <p className="text-xs text-muted-foreground">Comparações arquivadas</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {userCurrentUsage.savedComparisons}
                </div>
                <div className="text-xs text-muted-foreground">
                  de {plan.limitations.savedComparisons === -1 ? "∞" : plan.limitations.savedComparisons}
                </div>
              </div>
            </div>
            {plan.limitations.savedComparisons !== -1 && (
              <div className="relative">
                <Progress
                  value={getUsagePercentage(userCurrentUsage.savedComparisons, plan.limitations.savedComparisons)}
                  className="h-3 bg-green-100 dark:bg-green-900/30"
                />
              </div>
            )}
          </div>

          {/* Alertas de Preço */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50/50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10 border border-amber-200/30 dark:border-amber-800/30 hover:shadow-lg transition-all duration-300 group/item">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                  {getUsageIcon('alerts')}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Alertas de preço</h4>
                  <p className="text-xs text-muted-foreground">Notificações ativas</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {userCurrentUsage.priceAlerts}
                </div>
                <div className="text-xs text-muted-foreground">
                  de {plan.limitations.priceAlerts === -1 ? "∞" : plan.limitations.priceAlerts}
                </div>
              </div>
            </div>
            {plan.limitations.priceAlerts !== -1 && (
              <div className="relative">
                <Progress
                  value={getUsagePercentage(userCurrentUsage.priceAlerts, plan.limitations.priceAlerts)}
                  className="h-3 bg-amber-100 dark:bg-amber-900/30"
                />
              </div>
            )}
          </div>

          {/* Ofertas Diárias */}
          {plan.limitations.dailyOffersVisible !== Infinity && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50/50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10 border border-purple-200/30 dark:border-purple-800/30 hover:shadow-lg transition-all duration-300 group/item">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                    {getUsageIcon('offers')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Ofertas diárias</h4>
                    <p className="text-xs text-muted-foreground">
                      Até {plan.limitations.dailyOffersVisible === -1 ? "todas" : plan.limitations.dailyOffersVisible} ofertas visíveis
                    </p>
                  </div>
                </div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {plan.limitations.dailyOffersVisible === -1 ? "∞" : plan.limitations.dailyOffersVisible}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-4">
          {currentPlan !== "free" ? (
            <Button
              variant="outline"
              onClick={manageSubscription}
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/30 border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg group/btn"
            >
              <Settings className="w-5 h-5 mr-3 group-hover/btn:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Gerenciar Assinatura</span>
            </Button>
          ) : (
            <Link to="/plans" className="block">
              <Button className="w-full h-12 bg-gradient-to-r from-primary via-primary/90 to-secondary hover:from-primary/90 hover:via-primary/80 hover:to-secondary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group/btn">
                <TrendingUp className="w-5 h-5 mr-3 group-hover/btn:scale-110 transition-transform duration-300" />
                <span>🚀 Fazer Upgrade Premium</span>
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
