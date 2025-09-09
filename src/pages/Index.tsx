import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DailyOffersSection from "@/components/DailyOffersSection";
import { PlanStatus } from "@/components/PlanStatus";
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
import {
  Zap,
  Target,
  DollarSign,
  MessageSquare,
  Badge,
  Clock,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionExpiryAlert } from "@/components/SubscriptionExpiryAlert";
import { PushNotificationTest } from "@/components/PushNotificationTest";

// Componente para itens com barra de progresso (uso limitado para manter padrão)
const ProgressItem = ({
  title,
  current,
  limit,
  icon,
  color,
  description,
}: {
  title: string;
  current: number;
  limit: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}) => (
  <div className="p-4 rounded-xl bg-gradient-to-r from-background via-background/95 to-muted/20 backdrop-blur-sm border border-border/50 hover:shadow-lg transition-all duration-300 group/item">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg bg-gradient-to-br from-${color}-500 to-${color}-600 text-white shadow-lg group-hover/item:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-lg font-bold text-${color}-600 dark:text-${color}-400`}>
          {current}
        </div>
        <div className="text-xs text-muted-foreground">
          de {limit === -1 ? "∞" : limit}
        </div>
      </div>
    </div>
    {limit !== -1 && (
      <Progress
        value={Math.min((current / limit) * 100, 100)}
        className={`h-3 bg-${color}-100 dark:bg-${color}-900/30`}
      />
    )}
  </div>
);

// Componente para itens sem barra de progresso
const InsightItem = ({
  title,
  value,
  icon,
  color,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  description: string;
}) => (
  <div className="p-4 rounded-xl bg-gradient-to-r from-background via-background/95 to-muted/20 backdrop-blur-sm border border-border/50 hover:shadow-lg transition-all duration-300 group/item">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg bg-gradient-to-br from-${color}-500 to-${color}-600 text-white shadow-lg group-hover/item:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-xl font-bold text-${color}-600 dark:text-${color}-400`}>
          {value}
        </div>
      </div>
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

      <div className="container mx-auto py-8 sm:py-16 px-4 sm:px-6">
        {/* Alerta de Expiração */}
        {user && <SubscriptionExpiryAlert />}
        
        {/* Seção Meu Plano e Uso */}
        {user && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-app-dark dark:text-white">
              Meu plano e uso
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
              {/* Card do Status do Plano (Esquerda) */}
              <div className="min-h-[360px]">
                <PlanStatus />
              </div>

              {/* Card: Visão Geral do Uso (Direita - Refatorado) */}
              <Card className="dark:bg-gray-800 min-h-[360px] flex flex-col justify-between relative overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl">
                    Visão Geral do Seu Uso
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Acompanhe suas atividades e benefícios do plano.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-start items-center px-6 py-4">
                  {loadingDashboardStats ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Carregando dados...</p>
                    </div>
                  ) : currentPlanDetails ? (
                    <>
                      <div className="w-full space-y-4">
                        <InsightItem
                          title="Dias na plataforma"
                          description="Total de dias desde o cadastro"
                          value={userDashboardStats.daysOnPlatform}
                          icon={<Clock />}
                          color="blue"
                        />
                        <InsightItem
                          title="Seus Feedbacks"
                          description="Total de feedbacks enviados"
                          value={userDashboardStats.totalFeedbacks}
                          icon={<MessageSquare />}
                          color="purple"
                        />
                         <InsightItem
                          title="Economia Total"
                          description="Economia estimada (R$)"
                          value={`R$ ${userDashboardStats.estimatedTotalSavings.toFixed(2).replace('.', ',')}`}
                          icon={<DollarSign />}
                          color="yellow"
                        />
                      </div>
                      <div className="pt-8 text-center w-full">
                          <p className="text-gray-600 dark:text-gray-300 mb-3">
                            Ajude a comunidade e ganhe benefícios!
                          </p>
                          <Link to="/contribute">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                              <PlusCircle className="w-5 h-5 mr-2" /> Adicionar uma Contribuição
                            </Button>
                          </Link>
                        </div>
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

        {/* Seção de Teste de Push Notifications (apenas para usuários logados) */}
        {user && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-app-dark dark:text-white">
              🔔 Teste de Notificações Push
            </h2>
            <div className="max-w-lg mx-auto">
              <PushNotificationTest />
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