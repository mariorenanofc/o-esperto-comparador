import { useEffect, useState, useRef, useCallback } from 'react';
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
  const channelsRef = useRef<any[]>([]);
  const isSetupRef = useRef(false);

  // Track setup status to prevent multiple initializations
  const setupStatusRef = useRef<{ userId?: string; isSetup: boolean }>({ isSetup: false });

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

  // Cleanup function for channels
  const cleanupChannels = useCallback(() => {
    console.log('useNotifications: Cleaning up channels, count:', channelsRef.current.length);
    channelsRef.current.forEach(channel => {
      if (channel) {
        channel.unsubscribe();
      }
    });
    channelsRef.current = [];
    isSetupRef.current = false;
  }, []);

  useEffect(() => {
    if (!user?.id) {
      cleanupChannels();
      setupStatusRef.current = { isSetup: false };
      return;
    }

    // Prevent multiple setups for the same user
    if (setupStatusRef.current.isSetup && setupStatusRef.current.userId === user.id) {
      return;
    }

    console.log('🔔 Setting up notifications for user:', user.id);
    setupStatusRef.current = { userId: user.id, isSetup: true };

    const setupNotifications = async () => {
      // Clean up any existing channels first
      cleanupChannels();

      try {
        // Setup user notifications channel for contribution updates
        const userChannel = supabase
          .channel(`user-notifications-${user.id}`, {
            config: {
              broadcast: { self: false },
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
              console.log('🔔 Contribution update received:', {
                product: payload.new.product_name,
                oldVerified: payload.old.verified,
                newVerified: payload.new.verified
              });
              
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
              } else if (payload.new.verified === false && payload.old.verified === null) {
                const notification: Notification = {
                  id: Date.now().toString(),
                  title: 'Contribuição Rejeitada ❌',
                  message: `Sua contribuição de ${payload.new.product_name} foi rejeitada`,
                  type: 'error',
                  timestamp: new Date(),
                  read: false
                };
                
                showNotification(notification);
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('✅ User notifications channel connected');
            } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
              console.error('❌ User channel error:', status);
            }
          });

        channelsRef.current.push(userChannel);

        // Check if user is admin and setup admin notifications
        const userIsAdmin = await isAdmin(user.id);
        
        if (userIsAdmin) {
          console.log('👑 Setting up admin notifications');
          
          const adminChannel = supabase
            .channel(`admin-notifications-${user.id}`, {
              config: {
                broadcast: { self: false },
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
                if (payload.new.user_id !== user.id) {
                  console.log('🔔 New contribution for admin:', {
                    contributor: payload.new.contributor_name,
                    product: payload.new.product_name,
                    store: payload.new.store_name
                  });
                  
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
              if (status === 'SUBSCRIBED') {
                console.log('✅ Admin notifications channel connected');
              } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
                console.error('❌ Admin channel error:', status);
              }
            });

          channelsRef.current.push(adminChannel);
        }
      } catch (error) {
        console.error('❌ Error setting up notifications:', error);
        setupStatusRef.current = { isSetup: false };
      }
    };

    setupNotifications();

    // Cleanup on unmount or user change
    return () => {
      cleanupChannels();
      setupStatusRef.current = { isSetup: false };
    };
  }, [user?.id, cleanupChannels]);

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