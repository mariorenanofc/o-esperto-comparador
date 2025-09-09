import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Users, Target, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminNotifications: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: "",
    message: "",
    type: "info",
    target: "all"
  });

  const handleSendNotification = async () => {
    if (!notificationData.title || !notificationData.message) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha título e mensagem",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement notification sending logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Notificação enviada!",
        description: "A notificação foi enviada com sucesso",
      });
      
      setNotificationData({
        title: "",
        message: "",
        type: "info",
        target: "all"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar notificação",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Centro de Notificações</h1>
        <p className="text-muted-foreground">
          Envie notificações para usuários e gerencie comunicações
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Notificações Enviadas Hoje
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">1,234</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Abertura
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">68.5%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% desde a semana passada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Alcançados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">856</div>
            <p className="text-xs text-muted-foreground">
              De 1,234 usuários ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Send Notification Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Enviar Nova Notificação
          </CardTitle>
          <CardDescription>
            Crie e envie notificações para seus usuários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Título da Notificação
              </label>
              <Input
                placeholder="Digite o título..."
                value={notificationData.title}
                onChange={(e) => setNotificationData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Tipo de Notificação
              </label>
              <Select
                value={notificationData.type}
                onValueChange={(value) => setNotificationData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Informação</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="warning">Aviso</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Mensagem
            </label>
            <Textarea
              placeholder="Digite a mensagem da notificação..."
              value={notificationData.message}
              onChange={(e) => setNotificationData(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Público Alvo
            </label>
            <Select
              value={notificationData.target}
              onValueChange={(value) => setNotificationData(prev => ({ ...prev, target: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os usuários</SelectItem>
                <SelectItem value="premium">Usuários Premium</SelectItem>
                <SelectItem value="pro">Usuários Pro</SelectItem>
                <SelectItem value="free">Usuários Gratuitos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSendNotification}
              disabled={isLoading}
              className="min-w-32"
            >
              {isLoading ? "Enviando..." : "Enviar Notificação"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações Recentes</CardTitle>
          <CardDescription>
            Histórico de notificações enviadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                title: "Nova atualização disponível",
                type: "info",
                sent: "2 horas atrás",
                reach: "1,234 usuários"
              },
              {
                title: "Manutenção programada",
                type: "warning", 
                sent: "1 dia atrás",
                reach: "856 usuários"
              },
              {
                title: "Oferta especial premium",
                type: "success",
                sent: "3 dias atrás", 
                reach: "542 usuários"
              }
            ].map((notification, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.sent} • {notification.reach}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  notification.type === 'info' ? 'bg-blue-100 text-blue-800' :
                  notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {notification.type}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotifications;