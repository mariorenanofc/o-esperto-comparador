import React from 'react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

export const NotificationTester: React.FC = () => {
  const { showNotification } = useNotifications();
  const { user } = useAuth();

  const testNotification = () => {
    const notification = {
      id: Date.now().toString(),
      title: 'Teste de Notificação 🔔',
      message: 'Esta é uma notificação de teste para verificar se o sistema está funcionando.',
      type: 'info' as const,
      timestamp: new Date(),
      read: false
    };
    
    showNotification(notification);
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button onClick={testNotification} variant="outline" size="sm">
        Testar Notificação
      </Button>
    </div>
  );
};