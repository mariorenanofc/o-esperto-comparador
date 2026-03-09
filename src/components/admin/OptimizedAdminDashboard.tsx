import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceMonitor } from './PerformanceMonitor';
import { EmailTestPanel } from './EmailTestPanel';
import { Badge } from '@/components/ui/badge';
import { Activity, Mail, Database, Settings, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardMetrics {
  avgResponseMs: number | null;
  emailsSent7d: number;
  dbUsagePercent: number | null;
  securityEvents7d: number;
}

export const OptimizedAdminDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    avgResponseMs: null,
    emailsSent7d: 0,
    dbUsagePercent: null,
    securityEvents7d: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const [perfRes, emailRes, dbRes, secRes] = await Promise.all([
          supabase.from('api_performance_logs').select('response_time_ms').gte('created_at', sevenDaysAgo),
          supabase.from('notification_send_log').select('id', { count: 'exact', head: true }).gte('sent_at', sevenDaysAgo),
          supabase.rpc('get_db_usage'),
          supabase.from('admin_audit_log').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
        ]);

        let avgMs: number | null = null;
        if (perfRes.data && perfRes.data.length > 0) {
          const sum = perfRes.data.reduce((a, l) => a + (l.response_time_ms || 0), 0);
          avgMs = Math.round(sum / perfRes.data.length);
        }

        const dbPercent = dbRes.data ? (dbRes.data as any).percent_used : null;

        setMetrics({
          avgResponseMs: avgMs,
          emailsSent7d: emailRes.count ?? 0,
          dbUsagePercent: dbPercent != null ? Number(dbPercent) : null,
          securityEvents7d: secRes.count ?? 0,
        });
      } catch (e) {
        console.error('Error fetching dashboard metrics:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const getPerformanceLabel = () => {
    if (metrics.avgResponseMs === null) return { text: 'Sem dados', color: 'text-muted-foreground', sub: 'Nenhum log registrado' };
    if (metrics.avgResponseMs < 200) return { text: `${metrics.avgResponseMs}ms`, color: 'text-green-600', sub: 'Tempo médio excelente' };
    if (metrics.avgResponseMs < 500) return { text: `${metrics.avgResponseMs}ms`, color: 'text-yellow-600', sub: 'Tempo médio aceitável' };
    return { text: `${metrics.avgResponseMs}ms`, color: 'text-red-600', sub: 'Tempo médio alto' };
  };

  const getDbLabel = () => {
    if (metrics.dbUsagePercent === null) return { text: 'N/A', color: 'text-muted-foreground', sub: 'Erro ao consultar' };
    if (metrics.dbUsagePercent < 50) return { text: `${metrics.dbUsagePercent}%`, color: 'text-green-600', sub: 'Uso saudável' };
    if (metrics.dbUsagePercent < 80) return { text: `${metrics.dbUsagePercent}%`, color: 'text-yellow-600', sub: 'Uso moderado' };
    return { text: `${metrics.dbUsagePercent}%`, color: 'text-red-600', sub: 'Uso alto' };
  };

  const getSecurityLabel = () => {
    if (metrics.securityEvents7d === 0) return { text: '0 eventos', color: 'text-green-600', sub: 'Nenhum evento recente' };
    if (metrics.securityEvents7d < 10) return { text: `${metrics.securityEvents7d} eventos`, color: 'text-yellow-600', sub: 'Últimos 7 dias' };
    return { text: `${metrics.securityEvents7d} eventos`, color: 'text-red-600', sub: 'Verifique os logs' };
  };

  const perf = getPerformanceLabel();
  const db = getDbLabel();
  const sec = getSecurityLabel();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Painel de administração e monitoramento</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <TrendingUp className="h-4 w-4 mr-1" />
          Dados em tempo real
        </Badge>
      </div>

      {/* Status Cards - Real Data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className={`text-2xl font-bold ${perf.color}`}>{perf.text}</div>
                <p className="text-xs text-muted-foreground">{perf.sub}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notificações</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">{metrics.emailsSent7d}</div>
                <p className="text-xs text-muted-foreground">Enviadas nos últimos 7 dias</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className={`text-2xl font-bold ${db.color}`}>{db.text}</div>
                <p className="text-xs text-muted-foreground">{db.sub}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Segurança</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className={`text-2xl font-bold ${sec.color}`}>{sec.text}</div>
                <p className="text-xs text-muted-foreground">{sec.sub}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">
            <Activity className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email Testing
          </TabsTrigger>
          <TabsTrigger value="security">
            <Settings className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="system">
            <Database className="h-4 w-4 mr-2" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <PerformanceMonitor />
        </TabsContent>

        <TabsContent value="email">
          <EmailTestPanel />
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Correções de Segurança Pendentes</CardTitle>
              <CardDescription>Algumas correções precisam ser feitas manualmente no dashboard do Supabase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/20 rounded-lg">
                  <h4 className="font-medium text-amber-800 dark:text-amber-300">⚠️ Extension in Public Schema</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">Extensões estão instaladas no schema público.</p>
                  <a href="https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public" target="_blank" rel="noopener noreferrer" className="text-sm text-amber-600 dark:text-amber-400 underline">Ver documentação →</a>
                </div>
                <div className="p-4 border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="font-medium text-red-800 dark:text-red-300">🔒 Leaked Password Protection</h4>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">Proteção contra senhas vazadas não está ativa.</p>
                  <a href="https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection" target="_blank" rel="noopener noreferrer" className="text-sm text-red-600 dark:text-red-400 underline">Configurar segurança →</a>
                </div>
                <div className="p-4 border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">📦 PostgreSQL Version</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">Versão do PostgreSQL possui patches de segurança disponíveis.</p>
                  <a href="https://supabase.com/docs/guides/platform/upgrading" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 underline">Guia de upgrade →</a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Otimizações Implementadas</CardTitle>
                <CardDescription>Melhorias aplicadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Índices de busca criados (GIN + Trigram)', 'Funções otimizadas de busca', 'Cache reativo melhorado', 'Sistema de teste de email', 'Monitor de performance'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Próximos Passos</CardTitle>
                <CardDescription>Preparação para Produção</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Testes completos de fluxos', 'Validar responsividade mobile', 'Configurar alertas de performance', 'Implementar logging detalhado', 'Setup de métricas de uso'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
