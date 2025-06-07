
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  created_at: string;
}

interface Analytics {
  totalUsers: number;
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
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    console.log('Fetched users:', data);
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
      throw error;
    }

    console.log('User plan updated successfully');
  },

  async getAnalytics(): Promise<Analytics> {
    console.log('Fetching analytics data...');
    
    try {
      // Total de usuários
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('Error counting users:', usersError);
      }

      // Total de comparações
      const { count: totalComparisons, error: comparisonsError } = await supabase
        .from('comparisons')
        .select('*', { count: 'exact', head: true });

      if (comparisonsError) {
        console.error('Error counting comparisons:', comparisonsError);
      }

      // Total de ofertas
      const { count: totalOffers, error: offersError } = await supabase
        .from('daily_offers')
        .select('*', { count: 'exact', head: true });

      if (offersError) {
        console.error('Error counting offers:', offersError);
      }

      // Distribuição de planos
      const { data: planData, error: planError } = await supabase
        .from('profiles')
        .select('plan')
        .not('plan', 'is', null);

      if (planError) {
        console.error('Error fetching plan data:', planError);
      }

      const planCounts = planData?.reduce((acc: any, user) => {
        acc[user.plan] = (acc[user.plan] || 0) + 1;
        return acc;
      }, {}) || {};

      const planPrices = {
        free: 0,
        premium: 19.90,
        pro: 39.90,
        empresarial: 99.90
      };

      const planDistribution = Object.entries(planCounts).map(([plan, count]) => ({
        plan,
        count: count as number,
        revenue: (count as number) * (planPrices[plan as keyof typeof planPrices] || 0)
      }));

      // Dados dos últimos 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: monthlyUsers } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString());

      const { data: monthlyComparisons } = await supabase
        .from('comparisons')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString());

      // Processar dados mensais
      const monthlyData: { [key: string]: { users: number; comparisons: number } } = {};
      
      monthlyUsers?.forEach(user => {
        const month = new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        if (!monthlyData[month]) monthlyData[month] = { users: 0, comparisons: 0 };
        monthlyData[month].users++;
      });

      monthlyComparisons?.forEach(comparison => {
        const month = new Date(comparison.created_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        if (!monthlyData[month]) monthlyData[month] = { users: 0, comparisons: 0 };
        monthlyData[month].comparisons++;
      });

      const monthlyGrowth = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        ...data
      }));

      // Atividade dos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentOffers } = await supabase
        .from('daily_offers')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      const { data: recentComparisons } = await supabase
        .from('comparisons')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Processar dados diários
      const dailyData: { [key: string]: { offers: number; comparisons: number } } = {};

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        dailyData[dateStr] = { offers: 0, comparisons: 0 };
      }

      recentOffers?.forEach(offer => {
        const date = new Date(offer.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        if (dailyData[date]) dailyData[date].offers++;
      });

      recentComparisons?.forEach(comparison => {
        const date = new Date(comparison.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        if (dailyData[date]) dailyData[date].comparisons++;
      });

      const dailyActivity = Object.entries(dailyData).map(([date, data]) => ({
        date,
        ...data
      }));

      const analytics: Analytics = {
        totalUsers: totalUsers || 0,
        totalComparisons: totalComparisons || 0,
        totalOffers: totalOffers || 0,
        planDistribution,
        monthlyGrowth,
        dailyActivity
      };

      console.log('Analytics data:', analytics);
      return analytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }
};
