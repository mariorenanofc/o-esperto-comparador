import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { SecurityMonitoringSection } from "@/components/admin/SecurityMonitoringSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Key, 
  Activity,
  Database,
  CheckCircle,
  XCircle
} from "lucide-react";

const Security: React.FC = () => {
  const securityMetrics = [
    {
      title: "Status de Segurança",
      value: "Seguro",
      description: "Todas as verificações passaram",
      icon: Shield,
      status: "success",
    },
    {
      title: "Tentativas de Login Falhadas",
      value: "12",
      description: "Últimas 24 horas",
      icon: AlertTriangle,
      status: "warning",
    },
    {
      title: "Sessões Ativas",
      value: "892",
      description: "Usuários conectados agora",
      icon: Activity,
      status: "info",
    },
    {
      title: "Rate Limits Ativos",
      value: "3",
      description: "IPs bloqueados temporariamente",
      icon: Lock,
      status: "error",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-green-600";
      case "warning": return "text-yellow-600";
      case "error": return "text-red-600";
      default: return "text-blue-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return CheckCircle;
      case "error": return XCircle;
      case "warning": return AlertTriangle;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-8">
      <AdminBreadcrumbs />
      
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Segurança e Monitoramento
        </h1>
        <p className="text-muted-foreground">
          Monitore a segurança da plataforma e gerencie controles de acesso
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityMetrics.map((metric, index) => {
          const StatusIcon = getStatusIcon(metric.status);
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <StatusIcon className={`h-5 w-5 ${getStatusColor(metric.status)}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">
                  {metric.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="monitoring" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Monitoramento e Logs
          </TabsTrigger>
          <TabsTrigger value="checks" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Verificações de Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring">
          <SecurityMonitoringSection />
        </TabsContent>

        <TabsContent value="checks">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Status dos Sistemas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Certificado SSL</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">RLS (Row Level Security)</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm">Rate Limiting</span>
                    </div>
                    <Badge variant="outline">3 bloqueios ativos</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Controles de Acesso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm">Políticas de Admin</span>
                    <Badge className="bg-green-100 text-green-800">Configurado</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm">Validação de Dados</span>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm">Sanitização SQL</span>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Security;