import React from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Bell, Settings, History, Lightbulb, Info } from 'lucide-react';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { NotificationHistory } from '@/components/notifications/NotificationHistory';

const Notifications: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
      <Navbar />
      
      <div className="container mx-auto py-6 md:py-8 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header com gradiente */}
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-4 shadow-lg">
              <Bell className="w-7 h-7" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Central de Notificações
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Gerencie suas notificações e histórico
            </p>
          </div>

          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto mb-6">
              <TabsTrigger value="history" className="flex items-center gap-2 text-sm">
                <History className="w-4 h-4" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 text-sm">
                <Settings className="w-4 h-4" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              <NotificationHistory />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <NotificationSettings />
            </TabsContent>
          </Tabs>

          {/* FAQs Colapsáveis */}
          <div className="mt-8">
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="how-it-works" className="border rounded-lg px-4 bg-card">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Info className="w-4 h-4 text-blue-500" />
                    Como funcionam as notificações?
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <p><strong>Em tempo real:</strong> Atualizações instantâneas sobre suas contribuições</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <p><strong>Configuráveis:</strong> Escolha quais tipos deseja receber</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <p><strong>Multiplataforma:</strong> Funciona em todos os dispositivos</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <p><strong>Seguras:</strong> Configurações criptografadas e protegidas</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tips" className="border rounded-lg px-4 bg-card">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Dicas para melhor experiência
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      <p><strong>Permissões:</strong> Autorize notificações no navegador</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      <p><strong>Som:</strong> Ative para não perder alertas importantes</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      <p><strong>Filtros:</strong> Configure apenas o que importa</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      <p><strong>Limpeza:</strong> Limpe o histórico regularmente</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
