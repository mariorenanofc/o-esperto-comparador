import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { NotificationSender } from "@/components/admin/NotificationSender";
import { NotificationHistory } from "@/components/notifications/NotificationHistory";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bell, 
  Send, 
  Users, 
  Settings, 
  TrendingUp,
  MessageSquare,
  History
} from "lucide-react";

const AdminNotifications: React.FC = () => {
  const notificationStats = [
    {
      title: "Notificações Enviadas Hoje",
      value: "234",
      description: "15 push, 219 in-app",
      icon: Send,
      color: "text-blue-600",
    },
    {
      title: "Taxa de Abertura",
      value: "78%",
      description: "Média das últimas 24h",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Usuários com Push Ativo",
      value: "892",
      description: "72% do total de usuários",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Notificações Pendentes",
      value: "12",
      description: "Aguardando aprovação",
      icon: MessageSquare,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      <AdminBreadcrumbs />
      
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Gerenciamento de Notificações
        </h1>
        <p className="text-muted-foreground">
          Envie notificações para usuários e monitore o engajamento
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {notificationStats.map((stat, index) => (
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

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Enviar Notificação
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <NotificationSender />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Histórico de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationHistory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminNotifications;