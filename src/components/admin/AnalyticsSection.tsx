
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Users, ShoppingBag, MessageSquare } from 'lucide-react';
import { supabaseAdminService } from '@/services/supabase/adminService';
import { toast } from 'sonner';

interface AnalyticsData {
  totalContributions: number;
  verifiedContributions: number;
  totalSuggestions: number;
  totalUsers: number;
  activeUsers: number;
}

export const AnalyticsSection = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      console.log('Fetching analytics data...');
      
      const data = await supabaseAdminService.getAnalytics();
      console.log('Analytics data:', data);
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error("Erro ao carregar dados de analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando dados...</p>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Erro ao carregar dados de analytics.</p>
          <Button onClick={fetchAnalytics} className="mt-2">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const verificationRate = analytics.totalContributions > 0 
    ? ((analytics.verifiedContributions / analytics.totalContributions) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Analytics</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchAnalytics}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeUsers} usuários online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contribuições</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalContributions}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.verifiedContributions} verificadas ({verificationRate}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sugestões</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSuggestions}</div>
            <p className="text-xs text-muted-foreground">
              Total de feedback recebido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verificationRate}%</div>
            <p className="text-xs text-muted-foreground">
              Contribuições aprovadas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Atividade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Contribuições Pendentes:</span>
                <span className="font-semibold">
                  {analytics.totalContributions - analytics.verifiedContributions}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Contribuições Aprovadas:</span>
                <span className="font-semibold text-green-600">
                  {analytics.verifiedContributions}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Usuários Ativos:</span>
                <span className="font-semibold">
                  {analytics.activeUsers}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total de Sugestões:</span>
                <span className="font-semibold">
                  {analytics.totalSuggestions}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status da Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Sistema:</span>
                <span className="text-green-600 font-semibold">✓ Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Banco de Dados:</span>
                <span className="text-green-600 font-semibold">✓ Conectado</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Autenticação:</span>
                <span className="text-green-600 font-semibold">✓ Funcionando</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Última Atualização:</span>
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
