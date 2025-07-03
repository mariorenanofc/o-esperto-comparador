
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  created_at: string;
  last_activity: string | null;
  is_online: boolean;
}

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  totalComparisons: number;
  totalOffers: number;
  planDistribution: { plan: string; count: number; revenue: number }[];
  monthlyGrowth: { month: string; users: number; comparisons: number }[];
  dailyActivity: { date: string; offers: number; comparisons: number }[];
}

export const supabaseAdminService = {
  async getAllUsers(): Promise<UserProfile[]> {
    console.log('Fetching all users for admin...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        name,
        plan,
        created_at,
        last_activity,
        is_online
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    console.log('Fetched users:', data?.length || 0);
    return data || [];
  },

  async getActiveUsers(): Promise<UserProfile[]> {
    console.log('Fetching active users...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        name,
        plan,
        created_at,
        last_activity,
        is_online
      `)
      .eq('is_online', true)
      .order('last_activity', { ascending: false });

    if (error) {
      console.error('Error fetching active users:', error);
      throw error;
    }

    console.log('Fetched active users:', data?.length || 0);
    return data || [];
  },

  async updateUserPlan(userId: string, newPlan: string): Promise<void> {
    console.log('Updating user plan:', userId, newPlan);
    
    const { error } = await supabase
      .from('profiles')
      .update({ plan: newPlan })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user plan:', error);
      throw new Error('Erro ao atualizar plano do usuário');
    }

    console.log('User plan updated successfully');
  },

  async approveContribution(contributionId: string): Promise<void> {
    console.log('=== APPROVING CONTRIBUTION ===');
    console.log('Contribution ID:', contributionId);
    
    try {
      // Verificar se o usuário atual é admin
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Authentication error:', authError);
        throw new Error('Usuário não autenticado');
      }

      console.log('Current user:', user.id);

      // Verificar se o usuário tem permissão de admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Erro ao verificar permissões');
      }

      console.log('User profile:', profile);

      if (profile.plan !== 'admin') {
        throw new Error('Usuário não tem permissão de administrador');
      }

      const { data, error } = await supabase
        .from('daily_offers')
        .update({ verified: true })
        .eq('id', contributionId)
        .select();

      if (error) {
        console.error('Database error approving contribution:', error);
        throw new Error(`Erro ao aprovar contribuição: ${error.message}`);
      }

      console.log('Contribution approved successfully:', data);
    } catch (error) {
      console.error('Error in approveContribution:', error);
      throw error;
    }
  },

  async rejectContribution(contributionId: string): Promise<void> {
    console.log('=== REJECTING CONTRIBUTION ===');
    console.log('Contribution ID:', contributionId);
    
    try {
      // Verificar se o usuário atual é admin
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Authentication error:', authError);
        throw new Error('Usuário não autenticado');
      }

      console.log('Current user:', user.id);

      // Verificar se o usuário tem permissão de admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Erro ao verificar permissões');
      }

      console.log('User profile:', profile);

      if (profile.plan !== 'admin') {
        throw new Error('Usuário não tem permissão de administrador');
      }

      const { data, error } = await supabase
        .from('daily_offers')
        .delete()
        .eq('id', contributionId)
        .select();

      if (error) {
        console.error('Database error rejecting contribution:', error);
        throw new Error(`Erro ao rejeitar contribuição: ${error.message}`);
      }

      console.log('Contribution rejected and deleted successfully:', data);
    } catch (error) {
      console.error('Error in rejectContribution:', error);
      throw error;
    }
  },

  async getAnalytics(): Promise<Analytics> {
    console.log('Fetching analytics data...');
    
    try {
      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Usuários ativos (online)
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_online', true);

      // Total de comparações
      const { count: totalComparisons } = await supabase
        .from('comparisons')
        .select('*', { count: 'exact', head: true });

      // Total de ofertas
      const { count: totalOffers } = await supabase
        .from('daily_offers')
        .select('*', { count: 'exact', head: true });

      // Distribuição de planos
      const { data: planData } = await supabase
        .from('profiles')
        .select('plan')
        .not('plan', 'is', null);

      const planCounts = planData?.reduce((acc: any, user) => {
        const plan = user.plan || 'free';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
      }, {}) || {};

      const planPrices = {
        free: 0,
        premium: 19.90,
        pro: 39.90,
        empresarial: 99.90,
        admin: 0
      };

      const planDistribution = Object.entries(planCounts).map(([plan, count]) => ({
        plan,
        count: count as number,
        revenue: (count as number) * (planPrices[plan as keyof typeof planPrices] || 0)
      }));

      const analytics: Analytics = {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalComparisons: totalComparisons || 0,
        totalOffers: totalOffers || 0,
        planDistribution,
        monthlyGrowth: [],
        dailyActivity: []
      };

      console.log('Analytics data:', analytics);
      return analytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }
};
