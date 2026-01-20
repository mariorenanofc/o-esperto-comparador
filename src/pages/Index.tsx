import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DailyOffersSection from "@/components/DailyOffersSection";
import { RegionalRanking } from "@/components/ranking/RegionalRanking";
import { Card, CardContent } from "@/components/ui/card";
import { getPlanById } from "@/lib/plans";
import { Link } from "react-router-dom";
import { contributionService } from "@/services/contributionService";
import { comparisonService } from "@/services/comparisonService";
import { Product, Store } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Clock,
  Crown,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionExpiryAlert } from "@/components/SubscriptionExpiryAlert";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection, AnimatedList, AnimatedListItem } from "@/components/ui/animated-section";

// Componente compacto para estatística
const StatCard = ({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className?: string;
}) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg bg-muted/50 ${className}`}>
    <div className="p-2 rounded-full bg-primary/10 text-primary">
      {icon}
    </div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  </div>
);

const Index: React.FC = () => {
  const { user, profile } = useAuth();
  const [userDashboardStats, setUserDashboardStats] = useState({
    daysOnPlatform: 0,
    totalFeedbacks: 0,
    estimatedTotalSavings: 0,
    savedComparisonsCount: 0,
  });
  const [loadingDashboardStats, setLoadingDashboardStats] = useState(true);

  const currentPlanDetails = user ? getPlanById(profile?.plan || "free") : null;

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user || !profile) {
        setLoadingDashboardStats(false);
        return;
      }

      setLoadingDashboardStats(true);
      try {
        // Calcular dias na plataforma
        const createdAtDate = new Date(profile.created_at || new Date());
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdAtDate.getTime());
        const daysOnPlatform = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Fetch total feedbacks by the user
        const userFeedbacks = await contributionService.getUserSuggestions(
          user.id
        );
        const totalFeedbacks = userFeedbacks.length;

        // Fetch saved comparisons count and calculate estimated total savings
        const savedComparisonsList = await comparisonService.getUserComparisons(
          user.id
        );
        const savedComparisonsCount = savedComparisonsList.length;

        let totalSavings = 0;
        savedComparisonsList.forEach((comparison: any) => {
          const products: Product[] = comparison.comparison_products.map(
            (cp: any) => cp.product
          );

          const storesMap = new Map<string, Store>();
          comparison.prices.forEach((p: any) => {
            if (!storesMap.has(p.store.id)) {
              storesMap.set(p.store.id, p.store);
            }
          });
          const stores: Store[] = Array.from(storesMap.values());

          const pricesByProductAndStore: {
            [productId: string]: { [storeId: string]: number };
          } = {};
          products.forEach((p) => {
            pricesByProductAndStore[p.id] = {};
          });
          comparison.prices.forEach((priceDetail: any) => {
            if (pricesByProductAndStore[priceDetail.product.id]) {
              pricesByProductAndStore[priceDetail.product.id][
                priceDetail.store.id
              ] = priceDetail.price;
            }
          });

          const calculateTotalByStore = () => {
            const totals: { [storeId: string]: number } = {};
            stores.forEach((store) => {
              let storeTotal = 0;
              products.forEach((product) => {
                const price = pricesByProductAndStore[product.id]?.[store.id];
                if (typeof price === "number") {
                  storeTotal += price * product.quantity;
                }
              });
              totals[store.id] = storeTotal;
            });
            return totals;
          };

          const findBestPriceForProduct = (product: Product) => {
            let bestPrice = Infinity;
            stores.forEach((store) => {
              const price = pricesByProductAndStore[product.id]?.[store.id];
              if (typeof price === "number" && price < bestPrice) {
                bestPrice = price;
              }
            });
            return bestPrice === Infinity ? 0 : bestPrice;
          };

          let optimalTotal = 0;
          products.forEach((product) => {
            optimalTotal += findBestPriceForProduct(product) * product.quantity;
          });

          const currentTotals = calculateTotalByStore();
          const highestTotal = Math.max(...Object.values(currentTotals));

          if (highestTotal > 0 && optimalTotal >= 0) {
            totalSavings += highestTotal - optimalTotal;
          }
        });

        setUserDashboardStats({
          daysOnPlatform,
          totalFeedbacks,
          estimatedTotalSavings: totalSavings,
          savedComparisonsCount,
        });
      } catch (error) {
        // Error handling for dashboard stats
      } finally {
        setLoadingDashboardStats(false);
      }
    };

    fetchDashboardStats();
  }, [user, profile]);

  return (
    <div className="min-h-screen bg-app-gray dark:bg-gray-900">
      <Navbar />
      <HeroSection />
      <DailyOffersSection />
      
      {/* Ranking Regional - só aparece se tiver dados */}
      <AnimatedSection className="container mx-auto py-6 px-4 sm:px-6" delay={0.1}>
        <RegionalRanking />
      </AnimatedSection>

      {/* Alerta de Expiração */}
      {user && (
        <AnimatedSection className="container mx-auto px-4 sm:px-6" delay={0.15}>
          <SubscriptionExpiryAlert />
        </AnimatedSection>
      )}

      {/* Resumo Compacto da Conta - apenas para usuários logados */}
      {user && (
        <AnimatedSection className="container mx-auto py-6 px-4 sm:px-6" delay={0.2}>
          <Card className="overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Info do Plano */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        Plano {currentPlanDetails?.name || "Free"}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {profile?.plan === "free" ? "Gratuito" : "Ativo"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {userDashboardStats.daysOnPlatform} dias na plataforma
                    </p>
                  </div>
                </div>

                {/* Estatísticas em linha */}
                {!loadingDashboardStats && (
                  <div className="flex flex-wrap gap-2 sm:gap-4">
                    <StatCard
                      icon={<Clock className="w-4 h-4" />}
                      label="Dias ativos"
                      value={userDashboardStats.daysOnPlatform}
                    />
                    <StatCard
                      icon={<DollarSign className="w-4 h-4" />}
                      label="Economia"
                      value={`R$ ${userDashboardStats.estimatedTotalSavings.toFixed(2).replace('.', ',')}`}
                      className="bg-green-50 dark:bg-green-950/30"
                    />
                  </div>
                )}

                {/* Botões de ação */}
                <div className="flex gap-2">
                  <Link to="/profile">
                    <Button variant="outline" size="sm">
                      Ver Perfil
                    </Button>
                  </Link>
                  {profile?.plan === "free" && (
                    <Link to="/plans">
                      <Button size="sm" className="gap-1">
                        <Sparkles className="w-4 h-4" />
                        Upgrade
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      )}

      {/* Seção Por que usar - Consolidada e Compacta */}
      <AnimatedSection className="container mx-auto py-8 sm:py-12 px-4 sm:px-6" delay={0.25}>
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6 sm:p-8 rounded-2xl border border-border/50">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
              Por que usar O Esperto Comparador?
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Economize tempo e dinheiro nas suas compras com nossa plataforma inteligente
            </p>
          </div>

          <AnimatedList className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.1}>
            <AnimatedListItem>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border/30 hover:shadow-md transition-all hover:-translate-y-1">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Economize até 40%</h3>
                  <p className="text-xs text-muted-foreground">Encontre os melhores preços</p>
                </div>
              </div>
            </AnimatedListItem>

            <AnimatedListItem>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border/30 hover:shadow-md transition-all hover:-translate-y-1">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Rápido e Fácil</h3>
                  <p className="text-xs text-muted-foreground">Compare em segundos</p>
                </div>
              </div>
            </AnimatedListItem>

            <AnimatedListItem>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border/30 hover:shadow-md transition-all hover:-translate-y-1">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Acompanhe Gastos</h3>
                  <p className="text-xs text-muted-foreground">Relatórios detalhados</p>
                </div>
              </div>
            </AnimatedListItem>

            <AnimatedListItem>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border/30 hover:shadow-md transition-all hover:-translate-y-1">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">100% Confiável</h3>
                  <p className="text-xs text-muted-foreground">Dados verificados</p>
                </div>
              </div>
            </AnimatedListItem>
          </AnimatedList>

          <div className="mt-6 text-center">
            <Link to="/comparison">
              <Button className="gap-2">
                Começar a Comparar
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>

      <footer className="bg-app-dark dark:bg-gray-950 text-white py-6 sm:py-8 border-t dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row justify-between lg:space-x-8">
            <div className="mb-6 lg:mb-0 lg:w-1/3">
              <h3 className="text-lg font-semibold mb-2">
                O Esperto Comparador
              </h3>
              <p className="text-gray-300 dark:text-gray-400 text-sm sm:text-base">
                Economize tempo e dinheiro nas suas compras de supermercado.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:gap-8 sm:grid-cols-3 lg:w-2/3">
              <div>
                <h3 className="text-sm font-semibold mb-2">Links</h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      to="/"
                      className="text-gray-300 dark:text-gray-400 hover:text-white text-sm"
                    >
                      Início
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/comparison"
                      className="text-gray-300 dark:text-gray-400 hover:text-white text-sm"
                    >
                      Comparar
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/reports"
                      className="text-gray-300 dark:text-gray-400 hover:text-white text-sm"
                    >
                      Relatórios
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contribute"
                      className="text-gray-300 dark:text-gray-400 hover:text-white text-sm"
                    >
                      Contribuir
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/plans"
                      className="text-gray-300 dark:text-gray-400 hover:text-white text-sm"
                    >
                      Planos
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Legal</h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      to="/terms"
                      className="text-gray-300 dark:text-gray-400 hover:text-white text-sm"
                    >
                      Termos
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/privacy"
                      className="text-gray-300 dark:text-gray-400 hover:text-white text-sm"
                    >
                      Privacidade
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 dark:border-gray-800 mt-6 sm:mt-8 pt-4 sm:pt-6 text-center">
            {/* Ano atualizado automaticamente */}
            <p className="text-gray-300 dark:text-gray-400 text-xs sm:text-sm">
              © {new Date().getFullYear()} Comparador Online. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;