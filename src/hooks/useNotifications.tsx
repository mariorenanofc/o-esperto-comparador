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
  const setupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUserIdRef = useRef<string | undefined>(undefined);
  const isSetupRef = useRef(false);

  const playNotificationSound = () => {
    try {
      console.log('🔊 Playing notification sound...');
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
      
      console.log('🔊 Notification sound played successfully');
    } catch (e) {
      console.error('❌ Could not play notification sound:', e);
    }
  };

  const showNotification = (notification: Notification) => {
    console.log('🔔 Showing notification:', notification.title);
    
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
    console.log('🧹 Cleaning up channels, count:', channelsRef.current.length);
    channelsRef.current.forEach(channel => {
      if (channel) {
        try {
          channel.unsubscribe();
        } catch (e) {
          console.log('Error unsubscribing channel:', e);
        }
      }
    });
    channelsRef.current = [];
    isSetupRef.current = false;
  }, []);

  // Setup notifications with retry logic
  const setupNotifications = useCallback(async (userId: string) => {
    try {
      console.log('🔔 Setting up notifications for user:', userId);
      
      // Clean up any existing channels first
      channelsRef.current.forEach(channel => {
        if (channel) {
          try {
            channel.unsubscribe();
          } catch (e) {
            console.log('Error unsubscribing channel:', e);
          }
        }
      });
      channelsRef.current = [];

      // Create unique channel names to avoid conflicts
      const timestamp = Date.now();
      
      // Setup user notifications channel for contribution updates
      const userChannel = supabase
        .channel(`user-notifications-${userId}-${timestamp}`, {
          config: {
            broadcast: { self: false },
            presence: { key: userId }
          }
        })
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'daily_offers',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('🔔 Contribution update received:', {
              product: payload.new.product_name,
              oldVerified: payload.old.verified,
              newVerified: payload.new.verified
            });
            
            if (payload.new.verified === true && payload.old.verified === false) {
              console.log('🔔 User contribution approved, showing notification');
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
              console.log('🔔 User contribution rejected, showing notification');
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
      const userIsAdmin = await isAdmin(userId);
      
      if (userIsAdmin) {
        console.log('👑 Setting up admin notifications');
        
        const adminChannel = supabase
          .channel(`admin-notifications-${userId}-${timestamp}`, {
            config: {
              broadcast: { self: false },
              presence: { key: userId }
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
              if (payload.new.user_id !== userId) {
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

      isSetupRef.current = true;
    } catch (error) {
      console.error('❌ Error setting up notifications:', error);
      isSetupRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      cleanupChannels();
      currentUserIdRef.current = undefined;
      isSetupRef.current = false;
      return;
    }

    // If user changed, cleanup and reset
    if (currentUserIdRef.current !== user.id) {
      cleanupChannels();
      currentUserIdRef.current = user.id;
      isSetupRef.current = false;
    }

    // Skip if already setup for this user
    if (isSetupRef.current) {
      return;
    }

    // Setup notifications immediately
    setupNotifications(user.id);
  }, [user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupChannels();
      if (setupTimeoutRef.current) {
        clearTimeout(setupTimeoutRef.current);
      }
    };
  }, [cleanupChannels]);

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