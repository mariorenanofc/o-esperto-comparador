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
      
      // Criar uma melodia suave de duas notas
      const playNote = (frequency: number, startTime: number, duration: number, volume: number = 0.15) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Som mais suave - sine wave
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        // Envelope suave para evitar cliques
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      // Melodia suave: C5 -> E5 (notas agradáveis)
      const currentTime = audioContext.currentTime;
      playNote(523.25, currentTime, 0.3, 0.12); // C5
      playNote(659.25, currentTime + 0.15, 0.4, 0.1); // E5
      
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

      // Canal para feedback de sugestões do usuário
      const userSuggestionsChannel = supabase
        .channel(`user-suggestions-${userId}-${timestamp}`, {
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
            table: 'suggestions',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('🔔 Suggestion status update received:', {
              title: payload.new.title,
              oldStatus: payload.old.status,
              newStatus: payload.new.status
            });
            
            if (payload.new.status !== payload.old.status) {
              let notificationTitle = '';
              let notificationMessage = '';
              let notificationType: 'info' | 'success' | 'warning' | 'error' = 'info';
              
              switch (payload.new.status) {
                case 'in-review':
                  notificationTitle = 'Sugestão em Análise 🔍';
                  notificationMessage = `Sua sugestão "${payload.new.title}" está sendo analisada`;
                  notificationType = 'info';
                  break;
                case 'implemented':
                  notificationTitle = 'Sugestão Implementada! ✅';
                  notificationMessage = `Sua sugestão "${payload.new.title}" foi implementada`;
                  notificationType = 'success';
                  break;
                case 'closed':
                  notificationTitle = 'Sugestão Finalizada 📋';
                  notificationMessage = `Sua sugestão "${payload.new.title}" foi finalizada`;
                  notificationType = 'info';
                  break;
              }
              
              if (notificationTitle) {
                const notification: Notification = {
                  id: Date.now().toString(),
                  title: notificationTitle,
                  message: notificationMessage,
                  type: notificationType,
                  timestamp: new Date(),
                  read: false
                };
                
                showNotification(notification);
              }
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ User suggestions channel connected');
          } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            console.error('❌ User suggestions channel error:', status);
          }
        });

      channelsRef.current.push(userChannel, userSuggestionsChannel);

      // Check if user is admin and setup admin notifications
      const userIsAdmin = await isAdmin(userId);
      
      if (userIsAdmin) {
        console.log('👑 Setting up admin notifications');
        
        // Canal para novas contribuições de preços
        const adminContributionsChannel = supabase
          .channel(`admin-contributions-${userId}-${timestamp}`, {
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
              console.log('✅ Admin contributions channel connected');
            } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
              console.error('❌ Admin contributions channel error:', status);
            }
          });

        // Canal para novas sugestões
        const adminSuggestionsChannel = supabase
          .channel(`admin-suggestions-${userId}-${timestamp}`, {
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
              table: 'suggestions'
            },
            (payload) => {
              if (payload.new.user_id !== userId) {
                console.log('🔔 New suggestion for admin:', {
                  title: payload.new.title,
                  category: payload.new.category
                });
                
                const notification: Notification = {
                  id: Date.now().toString(),
                  title: 'Nova Sugestão 💡',
                  message: `${payload.new.title} (${payload.new.category})`,
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
              console.log('✅ Admin suggestions channel connected');
            } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
              console.error('❌ Admin suggestions channel error:', status);
            }
          });

        channelsRef.current.push(adminContributionsChannel, adminSuggestionsChannel);
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