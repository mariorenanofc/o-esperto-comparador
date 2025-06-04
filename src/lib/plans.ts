
export type PlanTier = 'free' | 'premium' | 'pro' | 'empresarial';

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
  };
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    priceId: '',
    description: 'Ideal para começar a economizar',
    features: [
      'Até 5 comparações por mês',
      'Comparação básica de preços',
      'Acesso às ofertas do dia',
      'Relatório mensal básico'
    ],
    limitations: {
      comparisonsPerMonth: 5,
      savedComparisons: 0,
      reportsHistory: 1,
      priceAlerts: 0
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.90,
    priceId: 'price_premium_monthly', // Substituir pelo ID real do Stripe
    description: 'Para quem quer economizar mais',
    features: [
      'Comparações ilimitadas',
      'Salvar até 10 comparações',
      'Alertas de preço (5 produtos)',
      'Relatórios detalhados (6 meses)',
      'Suporte prioritário',
      'Dashboard de economia'
    ],
    limitations: {
      comparisonsPerMonth: -1, // Ilimitado
      savedComparisons: 10,
      reportsHistory: 6,
      priceAlerts: 5
    },
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 39.90,
    priceId: 'price_pro_monthly', // Substituir pelo ID real do Stripe
    description: 'Para compradores profissionais',
    features: [
      'Tudo do Premium',
      'Comparações salvas ilimitadas',
      'Alertas de preço ilimitados',
      'Histórico completo de relatórios',
      'Exportação de dados (CSV/PDF)',
      'API de integração',
      'Análise de tendências'
    ],
    limitations: {
      comparisonsPerMonth: -1,
      savedComparisons: -1,
      reportsHistory: -1,
      priceAlerts: -1
    }
  },
  {
    id: 'empresarial',
    name: 'Empresarial',
    price: 99.90,
    priceId: 'price_enterprise_monthly', // Substituir pelo ID real do Stripe
    description: 'Para empresas e equipes',
    features: [
      'Tudo do Pro',
      'Até 10 usuários',
      'Dashboard empresarial',
      'Relatórios personalizados',
      'Suporte dedicado',
      'Treinamento da equipe',
      'SLA garantido'
    ],
    limitations: {
      comparisonsPerMonth: -1,
      savedComparisons: -1,
      reportsHistory: -1,
      priceAlerts: -1
    }
  }
];

export const getPlanById = (id: PlanTier): Plan => {
  return PLANS.find(plan => plan.id === id) || PLANS[0];
};

export const canUseFeature = (userPlan: PlanTier, feature: keyof Plan['limitations'], currentUsage: number): boolean => {
  const plan = getPlanById(userPlan);
  const limit = plan.limitations[feature];
  
  // -1 significa ilimitado
  if (limit === -1) return true;
  
  return currentUsage < limit;
};
