import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

export const NotificationSystem: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Listen for real-time notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_offers',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time notification received:', payload);
          
          if (payload.eventType === 'UPDATE' && payload.new.verified === true) {
            const notification: Notification = {
              id: Date.now().toString(),
              title: 'Contribuição Aprovada!',
              message: `Sua contribuição de ${payload.new.product_name} foi aprovada`,
              type: 'success',
              timestamp: new Date(),
              read: false
            };
            
            showInAppNotification(notification);
          }
        }
      )
      .subscribe();

    // Listen for admin notifications
    const adminChannel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'daily_offers'
        },
        (payload) => {
          console.log('Admin notification received:', payload);
          
          // Check if user is admin
          if (user.email && isAdmin(user.email)) {
            const notification: Notification = {
              id: Date.now().toString(),
              title: 'Nova Contribuição',
              message: `Nova contribuição: ${payload.new.product_name} em ${payload.new.store_name}`,
              type: 'info',
              timestamp: new Date(),
              read: false
            };
            
            showInAppNotification(notification);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      adminChannel.unsubscribe();
    };
  }, [user]);

  const isAdmin = (email: string) => {
    // Check if user is admin based on email or plan
    return email.includes('admin') || email === 'mariovendasonline10K@gmail.com';
  };

  const showInAppNotification = (notification: Notification) => {
    // Add to notifications state
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    
    // Show toast notification
    toast(notification.title, {
      description: notification.message,
      action: notification.type === 'success' ? {
        label: 'Ver',
        onClick: () => setShowNotifications(true)
      } : undefined,
    });

    // Play notification sound
    playNotificationSound();

    // Show desktop notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192.png',
        badge: '/icon-192.png'
      });
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgcCEGH0fPTgjMGHm7A7+OZRA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUgwLUKXh8bllHgg2jdnyz4EuBSF1xe/glEILElyx5+ytWBUIQ5zd8sFuIAUuhM/z24o8AhZqvevhpVELDU+h5fC1ZBsINobV88p/LAUke8rx3I4+AxRZr+ftrVoUCECY2e/EcSEELIHM8diJOQcZab3q4qNQDAhPpOPwtmUeEj2Q1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgcCEGH0fPTgjMGHm7A7+OZRA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUgwLUKXh8bllHgg2jdnyz4EuBSF1xe/glEILElyx5+ytWBUIQ5zd8sFuIAUuhM/z24o8AhZqvevhpVELDU+h5fC1ZBsINobV88p/LAUke8rx3I4+AxRZr+ftrVoUCECY2e/EcSEELIHM8diJOQcZab3q4qNQDAhPpOPwtmUeEj2Q1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgcCEGH0fPTgjMGHm7A7+OZRA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUgwLUKXh8bllHgg2jdnyz4EuBSF1xe/glEILElyx5+ytWBUIQ5zd8sFuIAUuhM/z24o8AhZqvevhpVELDU+h5fC1ZBsINobV88p/LAUke8rx3I4+AxRZr+ftrVoUCECY2e/EcSEELIHM8diJOQcZab3q4qNQDAhPpOPwtmUeEj2Q1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgcCEGH0fPTgjMGHm7A7+OZRA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUgwLUKXh8bllHgg2jdnyz4EuBSF1xe/glEILElyx5+ytWBUIQ5zd8sFuIAUuhM/z24o8AhZqvevhpVELDU+h5fC1ZBsINobV88p/LAUke8rx3I4+AxRZr+ftrVoUCECY2e/EcSEELIHM8diJOQcZab3q4qNQDAhPpOPwtmUeEj2Q1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgcCEGH0fPTgjMGHm7A7+OZRA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUgwLUKXh8bllHgg2jdnyz4EuBSF1xe/glEILElyx5+ytWBUIQ5zd8sFuIAUuhM/z24o8AhZqvevhpVELDU+h5fC1ZBsINobV88p/LAUke8rx3I4+AxRZr+ftrVoUCECY2e/EcSEELIHM8diJOQcZab3q4qNQDAhPpOPwtmUeEj2Q1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgcCEGH0fPTgjMGHm7A7+OZRA0PVqzn77BdGAg=';
      audio.play().catch(() => {
        // Fallback beep sound using Web Audio API
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 800;
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
          console.log('Could not play notification sound');
        }
      });
    } catch (e) {
      console.log('Could not play notification sound');
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (notifications.length === 0) return null;

  return (
    <>
      {/* Notification Bell */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative bg-background/80 backdrop-blur-sm border-border/50"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-16 right-4 w-80 max-h-96 bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notificações</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-border/30 hover:bg-muted/50 transition-colors ${
                  !notification.read ? 'bg-muted/30' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {notification.type === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {notification.type === 'info' && (
                      <Bell className="h-4 w-4 text-blue-500" />
                    )}
                    {notification.type === 'warning' && (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    {notification.type === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};