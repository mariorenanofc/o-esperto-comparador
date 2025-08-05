// src/pages/Index.tsx
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DailyOffersSection from "@/components/DailyOffersSection";
import { PlanStatus } from "@/components/PlanStatus";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getPlanById } from "@/lib/plans";
import { Link } from "react-router-dom";
import { contributionService } from "@/services/contributionService";
import { comparisonService } from "@/services/comparisonService";
import { Product, Store, ComparisonData } from "@/lib/types";
import { Button } from "@/components/ui/button";

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
        console.error("DEBUG ERROR: Error fetching dashboard stats:", error);
      } finally {
        setLoadingDashboardStats(false);
      }
    };

    fetchDashboardStats();
  }, [user, profile]);

  const getUsagePercentage = (current: number, limit: number | undefined) => {
    if (limit === -1 || limit === undefined || limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-app-gray dark:bg-gray-900">
      <Navbar />
      <HeroSection />
      <DailyOffersSection />

      <div className="container mx-auto py-8 sm:py-16 px-4 sm:px-6">
        {/* Seção Meu Plano e Uso */}
        {user && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-app-dark dark:text-white">
              Meu plano e uso
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
              {/* Card do Status do Plano */}
              <div className="min-h-[360px]">
                {" "}
                {/* Mantido min-h para igualar ao outro card */}
                <PlanStatus />
              </div>

              {/* Novo Card: Visão Geral do Uso */}
              <Card className="dark:bg-gray-800 min-h-[360px] flex flex-col justify-between">
                {" "}
                {/* Mantido min-h e flex para espaçamento interno */}
                <CardHeader>
                  <CardTitle className="text-xl">
                    Visão Geral do Seu Uso
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Acompanhe suas atividades e benefícios do plano.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between items-center px-6 py-4">
                  {loadingDashboardStats ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Carregando dados...</p>
                    </div>
                  ) : currentPlanDetails ? (
                    <>
                      {/* Círculos de Métricas - Layout Pirâmide (Ajustado) */}
                      <div className="flex flex-col items-center w-full mt-4 mb-8">
                        {" "}
                        {/* mt-4 para espaçamento do header, mb-8 para empurrar o conteúdo de baixo */}
                        {/* Círculo do Topo (Dias na Plataforma) */}
                        <div className="flex flex-col items-center">
                          {" "}
                          {/* Removido posicionamento relativo */}
                          <div className="flex items-center justify-center h-28 w-28 rounded-full border-2 border-app-blue bg-app-blue/10 text-app-blue text-5xl font-bold flex-shrink-0">
                            {userDashboardStats.daysOnPlatform}
                          </div>
                          <p className="text-sm font-bold text-gray-600 dark:text-gray-300 mt-2 text-center">
                            Dias na plataforma
                          </p>
                        </div>
                        {/* Círculos de Baixo (Feedbacks e Economia) - Novo container flex para as 2 bolinhas */}
                        <div className="flex justify-around w-full max-w-sm mt-6">
                          {" "}
                          {/* max-w-sm para controlar largura, mt-6 para subir um pouco e aproximar */}
                          {/* Total de Feedbacks (Esquerda - Verde) */}
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center h-24 w-24 rounded-full border-2 border-app-green bg-app-green/10 text-app-green text-3xl font-bold flex-shrink-0">
                              {userDashboardStats.totalFeedbacks}
                            </div>
                            <p className="text- font-bold text-gray-600 dark:text-gray-300 mt-2 text-center">
                              Seus Feedbacks
                            </p>
                          </div>
                          {/* Economia Total Estimada (Direita - Amarelo) */}
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center h-24 w-24 rounded-full border-2 border-yellow-500 bg-yellow-500/10 text-yellow-500 text-2xl font-bold flex-shrink-0 text-center">
                              R${" "}
                              {userDashboardStats.estimatedTotalSavings.toFixed(
                                0
                              )}
                            </div>
                            <p className="text- font-bold text-gray-600 dark:text-gray-300 mt-2 text-center">
                              Economia Total
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Comparações Mês (Consumo) */}
                      <div className="w-full mt-auto">
                        {" "}
                        {/* mt-auto para empurrar para baixo, w-full para ocupar espaço */}
                        <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                          <span>Comparações Mês (Consumo)</span>
                          <span>
                            {profile?.comparisons_made_this_month || 0}/
                            {currentPlanDetails.limitations
                              .comparisonsPerMonth === -1
                              ? "∞"
                              : currentPlanDetails.limitations
                                  .comparisonsPerMonth}
                          </span>
                        </div>
                        {currentPlanDetails.limitations.comparisonsPerMonth !==
                          -1 && (
                          <Progress
                            value={getUsagePercentage(
                              profile?.comparisons_made_this_month || 0,
                              currentPlanDetails.limitations.comparisonsPerMonth
                            )}
                            trackClassName="bg-green-200 dark:bg-green-800"
                            indicatorClassName="bg-red-500"
                            className="h-2"
                          />
                        )}
                      </div>

                      {/* Comparações Salvas (consumo) */}
                      <div className="w-full mt-4">
                        {" "}
                        {/* mt-4 para espaçamento entre as barras */}
                        <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                          <span>Comparações Salvas (Consumo)</span>
                          <span>
                            {userDashboardStats.savedComparisonsCount}/
                            {currentPlanDetails.limitations.savedComparisons ===
                            -1
                              ? "∞"
                              : currentPlanDetails.limitations.savedComparisons}
                          </span>
                        </div>
                        {currentPlanDetails.limitations.savedComparisons !==
                          -1 && (
                          <Progress
                            value={getUsagePercentage(
                              userDashboardStats.savedComparisonsCount,
                              currentPlanDetails.limitations.savedComparisons
                            )}
                            trackClassName="bg-green-200 dark:bg-green-800"
                            indicatorClassName="bg-red-500"
                            className="h-2"
                          />
                        )}
                      </div>

                      {/* Se for plano Gratuito, oferecer Upgrade */}
                      {currentPlanDetails.id === "free" && (
                        <div className="pt-4 text-center w-full">
                          <p className="text-gray-600 dark:text-gray-300 mb-3">
                            Desbloqueie mais com um plano Premium!
                          </p>
                          <Link to="/plans">
                            <Button className="w-full bg-app-green hover:bg-green-600">
                              Ver Planos e Fazer Upgrade
                            </Button>
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">
                      Faça login para ver seu uso detalhado.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
            ✨ Como Funciona ✨
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            O Comparador Online ajuda você a encontrar os melhores preços em
            diferentes supermercados de forma simples e eficiente.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-emerald-900/30 dark:via-gray-800 dark:to-green-900/30 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-emerald-100 dark:border-emerald-800/50 hover:scale-105 hover:-rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="text-white text-2xl font-bold animate-pulse">
                  🛒
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                Adicione Produtos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Insira os produtos que deseja comparar e os preços em diferentes
                supermercados com nossa interface intuitiva.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-900/30 dark:via-gray-800 dark:to-cyan-900/30 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-blue-100 dark:border-blue-800/50 hover:scale-105 hover:rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="text-white text-2xl font-bold animate-bounce">
                  📊
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                Compare Preços
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Veja instantaneamente onde cada produto está mais barato e quanto
                você pode economizar com análises em tempo real.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-yellow-50 dark:from-amber-900/30 dark:via-gray-800 dark:to-yellow-900/30 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-amber-100 dark:border-amber-800/50 hover:scale-105 hover:-rotate-1 sm:col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="text-white text-2xl font-bold animate-pulse">
                  💰
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
                Economize
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Faça suas compras com base nos resultados e acompanhe sua economia
                ao longo do tempo com relatórios detalhados.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-20 relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-purple-900/20 dark:via-gray-800 dark:to-indigo-900/20 p-8 rounded-2xl shadow-2xl border border-purple-100 dark:border-purple-800/30">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-indigo-400/5"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pr-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                🚀 Por que usar o Comparador Online?
              </h2>
              <ul className="space-y-4">
                <li className="group flex items-start p-3 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 dark:hover:from-emerald-900/20 dark:hover:to-green-900/20">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-sm">💰</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors duration-300">
                    Economize tempo e dinheiro em suas compras de supermercado
                  </span>
                </li>
                <li className="group flex items-start p-3 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/20">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-sm">⚡</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-300">
                    Compare preços em diferentes mercados de forma rápida e fácil
                  </span>
                </li>
                <li className="group flex items-start p-3 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-sm">📊</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors duration-300">
                    Acompanhe seus gastos mensais e identifique oportunidades de economia
                  </span>
                </li>
                <li className="group flex items-start p-3 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-sm">✨</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors duration-300">
                    Interface intuitiva e fácil de usar
                  </span>
                </li>
              </ul>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                <img
                  src="https://images.unsplash.com/photo-1579113800032-c38bd7635818?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
                  alt="Economizando nas compras"
                  className="relative rounded-xl shadow-2xl w-full max-w-md mx-auto transform group-hover:scale-105 transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

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
                    <a
                      href="/"
                      className="text-gray-300 dark:text-gray-400 hover:text-white text-sm"
                    >
                      Início
                    </a>
                  </li>
                  <li>
                    <a
                      href="/comparison"
                      className="text-gray-300 dark:text-gray-400 hover:text-white text-sm"
                    >
                      Comparar
                    </a>
                  </li>
                  <li>
                    <a
                      href="/reports"
                      className="text-gray-300 dark:text-gray-400 hover:text-white text-sm"
                    >
                      Relatórios
                    </a>
                  </li>
                  <li>
                    <a
                      href="/contribute"
                      className="text-gray-300 dark:text-gray-400 hover:text-white text-sm"
                    >
                      Contribuir
                    </a>
                  </li>
                  <li>
                    <a
                      href="/plans"
                      className="text-gray-300 dark:text-gray-400 hover:text-white text-sm"
                    >
                      Planos
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Legal</h3>
                <ul className="space-y-1">
                  <li>
                    <a
                      href="/terms"
                      className="text-gray-300 dark:text-gray-400 hover:text-white text-sm"
                    >
                      Termos
                    </a>
                  </li>
                  <li>
                    <a
                      href="/privacy"
                      className="text-gray-300 dark:text-gray-400 hover:text-white text-sm"
                    >
                      Privacidade
                    </a>
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
