import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Settings, Database, Bell, Mail, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DbUsageCard } from "@/components/admin/DbUsageCard";

const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    siteName: "EconomiaCerta",
    maintenanceMode: false,
    registrationOpen: true,
    emailNotifications: true,
    pushNotifications: true,
    analyticsEnabled: true,
    cacheEnabled: true,
    debugMode: false
  });

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações foram atualizadas com sucesso",
    });
  };

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações do Sistema</h1>
        <p className="text-muted-foreground">
          Gerencie configurações globais da plataforma
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
          <CardDescription>
            Configurações básicas da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nome do Site
              </label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                placeholder="Nome da plataforma"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Modo de Manutenção</p>
                <p className="text-sm text-muted-foreground">
                  Bloqueia acesso de usuários para manutenção
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={() => handleToggle('maintenanceMode')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Registro Aberto</p>
                <p className="text-sm text-muted-foreground">
                  Permite novos usuários se cadastrarem
                </p>
              </div>
              <Switch
                checked={settings.registrationOpen}
                onCheckedChange={() => handleToggle('registrationOpen')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Mode Debug</p>
                <p className="text-sm text-muted-foreground">
                  Habilita logs detalhados (apenas desenvolvimento)
                </p>
              </div>
              <Switch
                checked={settings.debugMode}
                onCheckedChange={() => handleToggle('debugMode')}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings}>
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações de Notificações
          </CardTitle>
          <CardDescription>
            Controle o sistema de notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Notificações por Email</p>
              <p className="text-sm text-muted-foreground">
                Enviar notificações administrativas por email
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={() => handleToggle('emailNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                Notificações push para usuários
              </p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={() => handleToggle('pushNotifications')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Performance e Analytics
          </CardTitle>
          <CardDescription>
            Configurações de desempenho da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Cache Habilitado</p>
              <p className="text-sm text-muted-foreground">
                Usar cache para melhorar performance
              </p>
            </div>
            <Switch
              checked={settings.cacheEnabled}
              onCheckedChange={() => handleToggle('cacheEnabled')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Analytics</p>
              <p className="text-sm text-muted-foreground">
                Coletar dados de uso da plataforma
              </p>
            </div>
            <Switch
              checked={settings.analyticsEnabled}
              onCheckedChange={() => handleToggle('analyticsEnabled')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Database Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Uso do Banco de Dados
          </CardTitle>
          <CardDescription>
            Monitoramento do uso de recursos do banco
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DbUsageCard />
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
          <CardDescription>
            Detalhes técnicos da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Versão da Plataforma</p>
              <p className="text-sm text-muted-foreground">v2.1.0</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Último Deploy</p>
              <p className="text-sm text-muted-foreground">15 Jan 2024, 14:30</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Ambiente</p>
              <p className="text-sm text-muted-foreground">Produção</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Uptime</p>
              <p className="text-sm text-muted-foreground">99.98%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;