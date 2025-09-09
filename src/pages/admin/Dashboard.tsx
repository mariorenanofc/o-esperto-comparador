import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Bell, TrendingUp, Activity, Shield } from "lucide-react";
import { AnalyticsSection } from "@/components/admin/AnalyticsSection";
import { ActiveUsersSection } from "@/components/admin/ActiveUsersSection";
import { PendingContributionsSection } from "@/components/admin/PendingContributionsSection";

const Dashboard: React.FC = () => {
  const statsCards = [
    {
      title: "Usuários Ativos",
      value: "1,234",
      description: "+12% desde o mês passado",
      icon: Users,
      trend: "up"
    },
    {
      title: "Contribuições",
      value: "856",
      description: "+8% desde o mês passado", 
      icon: FileText,
      trend: "up"
    },
    {
      title: "Notificações Enviadas",
      value: "2,341",
      description: "+23% desde o mês passado",
      icon: Bell,
      trend: "up"
    },
    {
      title: "Taxa de Crescimento",
      value: "18.2%",
      description: "+2.1% desde o mês passado",
      icon: TrendingUp,
      trend: "up"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral da sua plataforma e métricas principais
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription>
              Métricas de uso da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsSection />
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários Online
            </CardTitle>
            <CardDescription>
              Usuários atualmente ativos na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActiveUsersSection />
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Ações Pendentes
            </CardTitle>
            <CardDescription>
              Contribuições e sugestões que precisam de aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PendingContributionsSection />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;