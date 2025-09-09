import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Eye, Clock, Globe } from "lucide-react";
import { AnalyticsSection } from "@/components/admin/AnalyticsSection";

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics e Relatórios</h1>
        <p className="text-muted-foreground">
          Análises detalhadas do uso da plataforma e comportamento dos usuários
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Visualizações de Página
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">45,231</div>
            <p className="text-xs text-muted-foreground">
              +20.1% desde ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sessões Únicas
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">2,350</div>
            <p className="text-xs text-muted-foreground">
              +180 desde ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tempo Médio de Sessão
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">4m 32s</div>
            <p className="text-xs text-muted-foreground">
              +12s desde ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Rejeição
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">18.2%</div>
            <p className="text-xs text-muted-foreground">
              -2.3% desde ontem
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Visão Geral do Tráfego
          </CardTitle>
          <CardDescription>
            Métricas de tráfego e engajamento dos últimos 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsSection />
        </CardContent>
      </Card>

      {/* Traffic Sources & Top Pages */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fontes de Tráfego</CardTitle>
            <CardDescription>
              De onde vêm os visitantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Direto</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">45.2%</p>
                  <p className="text-xs text-muted-foreground">1,065 visitas</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Google</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">32.1%</p>
                  <p className="text-xs text-muted-foreground">756 visitas</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Redes Sociais</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">12.8%</p>
                  <p className="text-xs text-muted-foreground">301 visitas</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Referências</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">9.9%</p>
                  <p className="text-xs text-muted-foreground">233 visitas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Páginas Mais Visitadas</CardTitle>
            <CardDescription>
              Conteúdo mais popular
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Página Inicial</span>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">12,543</p>
                  <p className="text-xs text-muted-foreground">27.8% do tráfego</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Comparação</span>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">8,921</p>
                  <p className="text-xs text-muted-foreground">19.7% do tráfego</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Ofertas Diárias</span>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">6,432</p>
                  <p className="text-xs text-muted-foreground">14.2% do tráfego</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Catálogo de Produtos</span>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">4,876</p>
                  <p className="text-xs text-muted-foreground">10.8% do tráfego</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Planos</span>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">3,245</p>
                  <p className="text-xs text-muted-foreground">7.2% do tráfego</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Behavior */}
      <Card>
        <CardHeader>
          <CardTitle>Comportamento dos Usuários</CardTitle>
          <CardDescription>
            Como os usuários interagem com a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">73%</div>
              <p className="text-sm text-muted-foreground">Usuários que fazem comparações</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">45%</div>
              <p className="text-sm text-muted-foreground">Contribuem com preços</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">28%</div>
              <p className="text-sm text-muted-foreground">Fazem upgrade para Premium</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;