
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, ShoppingCart, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { supabaseAdminService } from '@/services/supabase/adminService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface Analytics {
  totalUsers: number;
  totalComparisons: number;
  totalOffers: number;
  planDistribution: { plan: string; count: number; revenue: number }[];
  monthlyGrowth: { month: string; users: number; comparisons: number }[];
  dailyActivity: { date: string; offers: number; comparisons: number }[];
}

export const AnalyticsSection = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await supabaseAdminService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const planColors = {
    free: '#6B7280',
    premium: '#3B82F6',
    pro: '#8B5CF6',
    empresarial: '#F59E0B'
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Analytics da Plataforma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando dados de analytics...</p>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Analytics da Plataforma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Erro ao carregar dados de analytics.</p>
        </CardContent>
      </Card>
    );
  }

  const totalRevenue = analytics.planDistribution.reduce((acc, plan) => acc + plan.revenue, 0);

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold">{analytics.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Comparações</p>
                <p className="text-2xl font-bold">{analytics.totalComparisons}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ofertas do Dia</p>
                <p className="text-2xl font-bold">{analytics.totalOffers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crescimento Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#8884d8" name="Usuários" />
                <Line type="monotone" dataKey="comparisons" stroke="#82ca9d" name="Comparações" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Planos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ plan, count }) => `${plan}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={planColors[entry.plan as keyof typeof planColors] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Atividade Diária */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade dos Últimos 7 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="offers" fill="#8884d8" name="Ofertas" />
              <Bar dataKey="comparisons" fill="#82ca9d" name="Comparações" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detalhes dos Planos */}
      <Card>
        <CardHeader>
          <CardTitle>Receita por Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.planDistribution.map((plan) => (
              <div key={plan.plan} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge 
                    style={{ 
                      backgroundColor: planColors[plan.plan as keyof typeof planColors] || '#6B7280',
                      color: 'white'
                    }}
                  >
                    {plan.plan === 'empresarial' ? 'Empresarial' : plan.plan.charAt(0).toUpperCase() + plan.plan.slice(1)}
                  </Badge>
                  <span>{plan.count} usuários</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">R$ {plan.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    {totalRevenue > 0 ? ((plan.revenue / totalRevenue) * 100).toFixed(1) : 0}% do total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
