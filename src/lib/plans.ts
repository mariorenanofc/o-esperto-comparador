export type PlanTier = "free" | "premium" | "pro" | "admin";

export interface Plan {
  id: PlanTier;
  name: string;
  price: number;
  priceId: string; // Stripe price ID
  description: string;
  features: string[];
  limitations: {
    comparisonsPerMonth: number;
    savedComparisons: number;
    reportsHistory: number;
    priceAlerts: number;
    maxStoresPerComparison?: number;
    maxProductsPerComparison?: number;
    dailyOffersVisible?: number;
  };
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Gratuito",
    price: 0,
    priceId: "",
    description: "Ideal para começar a economizar e comparar",
    features: [
      "Até 4 estabelecimentos e 8 produtos por comparação",
      "Pode fazer 2 comparações por mês",
      "Pode salvar 1 comparação no banco de dados",
      "Acesso a 2 ofertas diárias no decorrer do mês",
      "Acesso a histórico de relatório do mês salvo",
    ],
    limitations: {
      maxStoresPerComparison: 4,
      maxProductsPerComparison: 8,
      comparisonsPerMonth: 2,
      savedComparisons: 1,
      reportsHistory: 0,
      priceAlerts: 0,
      dailyOffersVisible: 2,
    },
  },
  {
    id: "premium",
    name: "Premium",
    price: 14.99,
    priceId: "price_premium_monthly", // Substituir pelo ID real do Stripe
    description: "Para quem quer economizar e gerenciar mais",
    features: [
      "Até 10 estabelecimentos e 20 produtos por comparação",
      "Pode fazer 10 comparações por mês",
      "Pode salvar 5 comparações no banco de dados",
      "Alertas de preço (até 5 produtos)",
      "Relatórios detalhados (até 6 meses)",
    ],
    limitations: {
      maxStoresPerComparison: 10,
      maxProductsPerComparison: 20,
      comparisonsPerMonth: 10, // Ilimitado
      savedComparisons: 5,
      reportsHistory: 6,
      priceAlerts: 5,
      dailyOffersVisible: -1,
    },
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 29.9,
    priceId: "price_pro_monthly", // Substituir pelo ID real do Stripe
    description: "Para mais controle e pensamento ao longo prazo.",
    features: [
      "Estabelecimentos e produtos ilimitados por comparação",
      "Comparações ilimitadas por mês",
      "Pode salvar 12 comparações no banco de dados",
      "Acesso a todos os alertas do dia",
      "Histórico completo de relatórios",
      "Exportação de dados (CSV/PDF)",
      "Dashboard de economia",
      "Suporte dedicado",
    ],
    limitations: {
      maxStoresPerComparison: -1,
      maxProductsPerComparison: -1,
      comparisonsPerMonth: -1,
      savedComparisons: 12,
      reportsHistory: -1,
      priceAlerts: -1,
      dailyOffersVisible: -1,
    },
  },
];

export const getPlanById = (id: PlanTier): Plan => {
  if (id === "admin") {
    return {
      id: "admin",
      name: "Administrador",
      price: 0,
      priceId: "",
      description: "Acesso total e ilimitado para administradores do sistema",
      features: ["Todas as funcionalidades ilimitadas"],
      limitations: {
        comparisonsPerMonth: -1,
        savedComparisons: -1,
        reportsHistory: -1,
        priceAlerts: -1,
        maxStoresPerComparison: -1,
        maxProductsPerComparison: -1,
        dailyOffersVisible: -1,
      },
    };
  }
  return PLANS.find((plan) => plan.id === id) || PLANS[0];
};

export const canUseFeature = (
  userPlan: PlanTier,
  feature: keyof Plan["limitations"],
  currentUsage: number
): boolean => {
  if (userPlan == "admin") {
    return true;
  }
  const plan = getPlanById(userPlan);
  const limit = plan.limitations[feature];

  // -1 significa ilimitado
  if (limit === -1) return true;

  return currentUsage < limit;
};
