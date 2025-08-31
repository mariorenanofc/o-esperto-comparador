import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Settings, History } from 'lucide-react';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { NotificationHistory } from '@/components/notifications/NotificationHistory';

const Notifications: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
      <Navbar />
      
      <div className="container mx-auto py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              🔔 Central de Notificações
            </h1>
            <p className="text-xl text-muted-foreground">
              Gerencie suas notificações e histórico de atividades
            </p>
          </div>

          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-6">
              <NotificationHistory />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <NotificationSettings />
            </TabsContent>
          </Tabs>

          {/* Informações adicionais */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-500" />
                  Como funcionam as notificações?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p><strong>Em tempo real:</strong> Receba atualizações instantâneas sobre suas contribuições</p>
                  <p><strong>Configuráveis:</strong> Escolha quais tipos de notificação deseja receber</p>
                  <p><strong>Multiplataforma:</strong> Funciona no navegador, desktop e dispositivos móveis</p>
                  <p><strong>Seguras:</strong> Suas configurações são criptografadas e protegidas</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-green-500" />
                  Dicas para melhor experiência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p><strong>Permissões:</strong> Autorize notificações no navegador para receber alertas</p>
                  <p><strong>Som:</strong> Ative o som para não perder notificações importantes</p>
                  <p><strong>Filtros:</strong> Configure apenas as notificações que realmente importam</p>
                  <p><strong>Limpeza:</strong> Limpe o histórico regularmente para melhor performance</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;