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
import { AccountSummarySkeleton, RankingSkeleton, WhyUseSkeleton } from "@/components/skeletons/HomePageSkeletons";

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
    <div className="min-h-screen bg-background">
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
          {loadingDashboardStats ? (
            <AccountSummarySkeleton />
          ) : (
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
                      className="bg-accent/50"
                    />
                  </div>

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
          )}
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
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
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
                <div className="p-2 rounded-lg bg-secondary/50 text-secondary-foreground">
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
                <div className="p-2 rounded-lg bg-accent/50 text-accent-foreground">
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
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
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
    </div>
  );
};

export default Index;