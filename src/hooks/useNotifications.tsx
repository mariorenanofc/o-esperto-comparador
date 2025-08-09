import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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

  const isAdmin = (email: string) => {
    return email.includes('admin') || email === 'mariovendasonline10K@gmail.com';
  };

  useEffect(() => {
    console.log('useNotifications: useEffect triggered, user:', user);
    if (!user) {
      console.log('useNotifications: No user found');
      return;
    }

    console.log('useNotifications: Setting up real-time notification listeners for user:', user.id);
    console.log('useNotifications: User email:', user.email);

    // Listen for changes to daily_offers for user contributions
    const userChannel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'daily_offers',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('useNotifications: User contribution update received:', payload);
          
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
      .subscribe();

    // Listen for new contributions if user is admin
    let adminChannel: any = null;
    if (user.email && isAdmin(user.email)) {
      console.log('Setting up admin notifications for:', user.email);
      
      adminChannel = supabase
        .channel('admin-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'daily_offers'
          },
          (payload) => {
            console.log('useNotifications: New contribution received (admin):', payload);
            
            // Don't notify admin of their own contributions
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
        .subscribe();
    }

    return () => {
      userChannel.unsubscribe();
      if (adminChannel) {
        adminChannel.unsubscribe();
      }
    };
  }, [user]);

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