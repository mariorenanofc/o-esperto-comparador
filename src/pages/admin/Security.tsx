import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, Lock, Eye, Activity } from "lucide-react";

const Security: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Segurança e Auditoria</h1>
        <p className="text-muted-foreground">
          Monitore a segurança da plataforma e atividades administrativas
        </p>
      </div>

      {/* Security Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tentativas de Login Bloqueadas
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">23</div>
            <p className="text-xs text-muted-foreground">
              Nas últimas 24 horas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alertas de Segurança
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">5</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sessões Ativas
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">1,234</div>
            <p className="text-xs text-muted-foreground">
              Usuários conectados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Segurança
            </CardTitle>
            <Lock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">98.5%</div>
            <p className="text-xs text-muted-foreground">
              Score de segurança
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Alertas de Segurança
          </CardTitle>
          <CardDescription>
            Eventos que requerem atenção imediata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                type: "warning",
                title: "Múltiplas tentativas de login falharam",
                description: "IP 192.168.1.100 tentou acessar 15 contas diferentes",
                time: "5 minutos atrás"
              },
              {
                type: "info",
                title: "Nova sessão administrativa",
                description: "Admin mario@** fez login de novo dispositivo",
                time: "2 horas atrás"
              },
              {
                type: "warning",
                title: "Rate limit atingido",
                description: "API endpoint /api/prices recebeu tráfego anômalo",
                time: "4 horas atrás"
              }
            ].map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-4 border border-border rounded-lg">
                <div className={`p-2 rounded-full ${
                  alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {alert.type === 'warning' ? 
                    <AlertTriangle className="h-4 w-4" /> : 
                    <Eye className="h-4 w-4" />
                  }
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Log de Auditoria
          </CardTitle>
          <CardDescription>
            Registro de atividades administrativas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "USER_PLAN_UPDATE",
                admin: "mario@**",
                target: "user@**",
                details: "Plano alterado de Free para Premium",
                timestamp: "2024-01-15 14:30:25"
              },
              {
                action: "CONTRIBUTION_APPROVED",
                admin: "mario@**",
                target: "Oferta #1234",
                details: "Oferta de preço aprovada para validação",
                timestamp: "2024-01-15 14:15:10"
              },
              {
                action: "USER_ACCESS_GRANTED",
                admin: "system",
                target: "newuser@**",
                details: "Acesso administrativo concedido",
                timestamp: "2024-01-15 13:45:33"
              },
              {
                action: "SECURITY_SCAN",
                admin: "system",
                target: "Platform",
                details: "Verificação de segurança executada automaticamente",
                timestamp: "2024-01-15 12:00:00"
              }
            ].map((log, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-foreground">{log.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.admin} → {log.target} • {log.details}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Configurações de Segurança
          </CardTitle>
          <CardDescription>
            Políticas e configurações de segurança da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Rate Limiting</p>
                  <p className="text-sm text-muted-foreground">Limita requisições por IP</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Autenticação 2FA</p>
                  <p className="text-sm text-muted-foreground">Dois fatores para admins</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">HTTPS Forçado</p>
                  <p className="text-sm text-muted-foreground">Todas as conexões seguras</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Auditoria Completa</p>
                  <p className="text-sm text-muted-foreground">Log de todas as ações</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Backup Automático</p>
                  <p className="text-sm text-muted-foreground">Dados protegidos diariamente</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Monitoramento</p>
                  <p className="text-sm text-muted-foreground">Alertas em tempo real</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Security;