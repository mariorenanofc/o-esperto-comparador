import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { ReportsExporter } from "@/components/admin/ReportsExporter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  TrendingUp, 
  Calendar, 
  BarChart3,
  PieChart,
  LineChart,
  Download
} from "lucide-react";

const Analytics: React.FC = () => {
  // Mock analytics data
  const analyticsStats = [
    {
      title: "Relatórios Gerados",
      value: "1,234",
      description: "Este mês",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Taxa de Crescimento",
      value: "18.2%",
      description: "Vs. mês anterior",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Exportações Realizadas",
      value: "89",
      description: "Últimos 30 dias",
      icon: Download,
      color: "text-purple-600",
    },
    {
      title: "Métricas Monitoradas",
      value: "25",
      description: "KPIs ativos",
      icon: BarChart3,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      <AdminBreadcrumbs />
      
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Analytics e Relatórios
        </h1>
        <p className="text-muted-foreground">
          Gere relatórios detalhados e exporte dados da plataforma
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Exportar Relatórios
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Gráficos e Métricas
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Dashboard Personalizado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <ReportsExporter />
        </TabsContent>

        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Crescimento de Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <LineChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Gráfico de crescimento será implementado</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Distribuição de Planos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <PieChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Gráfico de distribuição será implementado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Dashboard Personalizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Dashboard Customizável</h3>
                <p className="text-muted-foreground mb-4">
                  Funcionalidade para criar dashboards personalizados será implementada
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;