import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceMonitor } from './PerformanceMonitor';
import { EmailTestPanel } from './EmailTestPanel';
import { Badge } from '@/components/ui/badge';
import { Activity, Mail, Database, Settings, TrendingUp } from 'lucide-react';

export const OptimizedAdminDashboard = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Painel otimizado de administração e monitoramento
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <TrendingUp className="h-4 w-4 mr-1" />
          Fase 1 - Otimizações
        </Badge>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Otimizado</div>
            <p className="text-xs text-muted-foreground">Índices e cache ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistema Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Ativo</div>
            <p className="text-xs text-muted-foreground">Resend configurado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">Melhorado</div>
            <p className="text-xs text-muted-foreground">Queries otimizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Segurança</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">Atenção</div>
            <p className="text-xs text-muted-foreground">Alguns warnings pendentes</p>
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
              <CardDescription>
                Algumas correções precisam ser feitas manualmente no dashboard do Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-800">⚠️ Extension in Public Schema</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Extensões estão instaladas no schema público. Considere mover para schema específico.
                  </p>
                  <a 
                    href="https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-yellow-600 underline"
                  >
                    Ver documentação →
                  </a>
                </div>

                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-800">🔒 Leaked Password Protection</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Proteção contra senhas vazadas não está ativa. Ative no dashboard do Supabase.
                  </p>
                  <a 
                    href="https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-red-600 underline"
                  >
                    Configurar segurança →
                  </a>
                </div>

                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800">📦 PostgreSQL Version</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Versão do PostgreSQL possui patches de segurança disponíveis. Atualize via dashboard.
                  </p>
                  <a 
                    href="https://supabase.com/docs/guides/platform/upgrading" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 underline"
                  >
                    Guia de upgrade →
                  </a>
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
                <CardDescription>Melhorias aplicadas na Fase 1</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Índices de busca criados (GIN + Trigram)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Funções otimizadas de busca de produtos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Cache reativo melhorado</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Sistema de teste de email</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Monitor de performance</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximos Passos</CardTitle>
                <CardDescription>Fase 2 - Preparação para Produção</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                  <span>Testes completos de fluxos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                  <span>Validar responsividade mobile</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                  <span>Configurar alertas de performance</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                  <span>Implementar logging detalhado</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                  <span>Setup de métricas de uso</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};