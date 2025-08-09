import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { isAdmin } from '@/lib/admin';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Add debug log to see if hook is being executed
  console.log('useNotifications: Hook initialized, user:', user?.id);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (e) {
      console.log('Could not play notification sound');
    }
  };

  const showNotification = (notification: Notification) => {
    console.log('Showing notification:', notification);
    
    // Add to state
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    
    // Show toast
    toast(notification.title, {
      description: notification.message,
      duration: 5000,
    });

    // Play sound
    playNotificationSound();

    // Show desktop notification if supported and permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192.png',
        badge: '/icon-192.png'
      });
    }
  };

  useEffect(() => {
    if (!user?.id) {
      console.log('useNotifications: No user ID, skipping setup');
      return;
    }

    console.log('useNotifications: Setting up notifications for user:', user.id);

    const setupNotifications = async () => {
      let userChannel: any = null;
      let adminChannel: any = null;

      // Setup user notifications channel
      console.log('useNotifications: Creating user channel');
      userChannel = supabase
        .channel(`user-notifications-${user.id}`, {
          config: {
            broadcast: { self: true },
            presence: { key: user.id }
          }
        })
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'daily_offers',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔔 useNotifications: User contribution update received:', payload);
            
            if (payload.new.verified === true && payload.old.verified === false) {
              const notification: Notification = {
                id: Date.now().toString(),
                title: 'Contribuição Aprovada! ✅',
                message: `Sua contribuição de ${payload.new.product_name} foi aprovada`,
                type: 'success',
                timestamp: new Date(),
                read: false
              };
              
              showNotification(notification);
            }
          }
        )
        .subscribe((status) => {
          console.log('useNotifications: User channel status:', status);
        });

      // Check if user is admin and setup admin notifications
      const userIsAdmin = await isAdmin(user.id);
      console.log('useNotifications: User is admin?', userIsAdmin);
      
      if (userIsAdmin) {
        console.log('useNotifications: Setting up admin notifications');
        
        adminChannel = supabase
          .channel(`admin-notifications-${user.id}`, {
            config: {
              broadcast: { self: true },
              presence: { key: user.id }
            }
          })
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'daily_offers'
            },
            (payload) => {
              console.log('🔔 useNotifications: New contribution received (admin):', payload);
              
              if (payload.new.user_id !== user.id) {
                const notification: Notification = {
                  id: Date.now().toString(),
                  title: 'Nova Contribuição 📝',
                  message: `${payload.new.contributor_name}: ${payload.new.product_name} em ${payload.new.store_name}`,
                  type: 'info',
                  timestamp: new Date(),
                  read: false
                };
                
                showNotification(notification);
              }
            }
          )
          .subscribe((status) => {
            console.log('useNotifications: Admin channel status:', status);
          });
      }

      // Cleanup function
      return () => {
        console.log('useNotifications: Cleaning up channels');
        userChannel?.unsubscribe();
        adminChannel?.unsubscribe();
      };
    };

    setupNotifications();
  }, [user?.id]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAllNotifications,
    showNotification
  };
};