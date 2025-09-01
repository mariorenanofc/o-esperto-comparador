import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bell, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const PushNotificationTest: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    swRegistered: boolean | null;
    vapidKey: boolean | null;
    subscription: boolean | null;
    permission: string | null;
  }>({
    swRegistered: null,
    vapidKey: null,
    subscription: null,
    permission: null,
  });

  const checkPushStatus = async () => {
    setIsLoading(true);
    const results = { ...testResults };

    try {
      // Check notification permission
      results.permission = Notification.permission;

      // Check service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        results.swRegistered = !!registration;

        if (registration) {
          // Check existing subscription
          const subscription = await registration.pushManager.getSubscription();
          results.subscription = !!subscription;
          console.log('Current subscription:', subscription);
        }
      } else {
        results.swRegistered = false;
      }

      // Test VAPID key fetch
      try {
        const { data, error } = await supabase.functions.invoke('get-vapid');
        if (error) throw error;
        results.vapidKey = !!data?.publicKey;
        console.log('VAPID key check:', data);
      } catch (error) {
        console.error('VAPID key fetch error:', error);
        results.vapidKey = false;
      }

      setTestResults(results);
    } catch (error) {
      console.error('Error checking push status:', error);
      toast.error('Erro ao verificar status das notificações');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!user?.id) {
      toast.error('Usuário não está logado');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('notify-user', {
        body: {
          userId: user.id,
          title: '🧪 Teste de Notificação',
          body: 'Esta é uma notificação de teste do sistema push!',
          data: { test: true }
        }
      });

      if (error) throw error;
      toast.success('Notificação de teste enviada!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Erro ao enviar notificação de teste');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    return status ? 
      <CheckCircle className="h-4 w-4 text-success" /> : 
      <XCircle className="h-4 w-4 text-destructive" />;
  };

  const getStatusColor = (status: boolean | null) => {
    if (status === null) return "secondary";
    return status ? "default" : "destructive";
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Teste de Notificações Push
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Service Worker</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.swRegistered)}
              <Badge variant={getStatusColor(testResults.swRegistered)}>
                {testResults.swRegistered === null ? "Não testado" : 
                 testResults.swRegistered ? "Registrado" : "Não registrado"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Chave VAPID</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.vapidKey)}
              <Badge variant={getStatusColor(testResults.vapidKey)}>
                {testResults.vapidKey === null ? "Não testado" : 
                 testResults.vapidKey ? "Configurada" : "Erro"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Subscription</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.subscription)}
              <Badge variant={getStatusColor(testResults.subscription)}>
                {testResults.subscription === null ? "Não testado" : 
                 testResults.subscription ? "Ativa" : "Inativa"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Permissão</span>
            <Badge variant={
              testResults.permission === "granted" ? "default" :
              testResults.permission === "denied" ? "destructive" : "secondary"
            }>
              {testResults.permission || "Não testado"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Usuário</span>
            <Badge variant={user ? "default" : "destructive"}>
              {user ? "Logado" : "Não logado"}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={checkPushStatus}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? "Verificando..." : "Verificar Status"}
          </Button>

          <Button 
            onClick={sendTestNotification}
            disabled={isLoading || !user}
            className="w-full"
          >
            {isLoading ? "Enviando..." : "Enviar Notificação Teste"}
          </Button>
        </div>

        {!user && (
          <p className="text-sm text-muted-foreground text-center">
            Faça login para testar as notificações
          </p>
        )}
      </CardContent>
    </Card>
  );
};