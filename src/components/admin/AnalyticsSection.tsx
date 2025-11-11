
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, CheckCircle, MessageSquare, RefreshCw, TrendingUp, Activity } from 'lucide-react';
import { supabaseAdminService } from '@/services/supabase/adminService';
import { DbUsageCard } from '@/components/admin/DbUsageCard';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { logger } from '@/lib/logger';

interface AnalyticsData {
  totalContributions: number;
  verifiedContributions: number;
  totalSuggestions: number;
  totalUsers: number;
  activeUsers: number;
}

interface AnalyticsKPIs {
  pageViews7d: number;
  featureUsage7d: number;
  avgResponseTime7d: number;
  errorRate7d: number;
}

export const AnalyticsSection = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [kpis, setKpis] = useState<AnalyticsKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleAsync } = useErrorHandler({ component: 'AnalyticsSection' });

  const fetchAnalytics = async () => {
    setLoading(true);
    const data = await handleAsync(
      async () => {
        logger.info('Fetching analytics data');
        const result = await supabaseAdminService.getAnalytics();
        logger.info('Analytics data received', { count: result?.totalUsers });
        return result;
      },
      { action: 'fetch_analytics' },
      { showToast: true, severity: 'medium' }
    );

    if (data) {
      setAnalytics(data);
      await fetchKPIs();
    }
    setLoading(false);
  };

  const fetchKPIs = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Page views from analytics_events
      const { data: pageViewsData } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact' })
        .eq('event_type', 'page_view')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Feature usage events
      const { data: featureUsageData } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact' })
        .eq('event_type', 'feature_usage')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Performance metrics
      const { data: performanceData } = await supabase
        .from('api_performance_logs')
        .select('response_time_ms, status_code')
        .gte('created_at', sevenDaysAgo.toISOString());

      let avgResponseTime = 0;
      let errorRate = 0;
      
      if (performanceData && performanceData.length > 0) {
        avgResponseTime = performanceData.reduce((sum, item) => sum + item.response_time_ms, 0) / performanceData.length;
        const errorCount = performanceData.filter(item => item.status_code >= 400).length;
        errorRate = (errorCount / performanceData.length) * 100;
      }

      const result = {
        pageViews7d: pageViewsData?.length || 0,
        featureUsage7d: featureUsageData?.length || 0,
        avgResponseTime7d: Math.round(avgResponseTime),
        errorRate7d: Math.round(errorRate * 100) / 100
      };
      
      logger.info('KPIs fetched successfully', result);
      setKpis(result);
    } catch (error) {
      logger.error('Error fetching KPIs', error as Error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics do Sistema</h2>
        </div>
        <div className="text-center py-8">
          <p>Carregando dados analíticos...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics do Sistema</h2>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">Erro ao carregar dados analíticos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics do Sistema</h2>
        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DbUsageCard />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <div className="text-xs text-muted-foreground">
              {analytics.activeUsers} ativos agora
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contribuições Totais</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalContributions}</div>
            <div className="text-xs text-muted-foreground">
              {analytics.verifiedContributions} verificadas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sugestões/Feedbacks</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSuggestions}</div>
            <div className="text-xs text-muted-foreground">
              Total de feedbacks recebidos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Verificação</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalContributions > 0 
                ? Math.round((analytics.verifiedContributions / analytics.totalContributions) * 100)
                : 0}%
            </div>
            <div className="text-xs text-muted-foreground">
              Contribuições verificadas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.activeUsers}</div>
            <div className="text-xs text-muted-foreground">
              Online agora
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contribuições Pendentes</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analytics.totalContributions - analytics.verifiedContributions}
            </div>
            <div className="text-xs text-muted-foreground">
              Aguardando aprovação
            </div>
          </CardContent>
        </Card>

        {kpis && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views (7d)</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{kpis.pageViews7d}</div>
                <div className="text-xs text-muted-foreground">
                  Visualizações de página
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uso de Features (7d)</CardTitle>
                <Activity className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{kpis.featureUsage7d}</div>
                <div className="text-xs text-muted-foreground">
                  Interações com recursos
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio API (7d)</CardTitle>
                <Activity className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">{kpis.avgResponseTime7d}ms</div>
                <div className="text-xs text-muted-foreground">
                  Resposta média da API
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};
