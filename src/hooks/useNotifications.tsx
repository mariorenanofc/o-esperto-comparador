import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { isAdmin } from '@/lib/admin';
import { logger } from '@/lib/logger';
import { useErrorHandler } from '@/hooks/useErrorHandler';

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
  const { handleAsync } = useErrorHandler({ component: 'useNotifications' });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const channelsRef = useRef<any[]>([]);
  const setupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUserIdRef = useRef<string | undefined>(undefined);
  const isSetupRef = useRef(false);

  const playNotificationSound = () => {
    try {
      logger.info('Playing notification sound');
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a pleasant two-tone notification sound
      const playTone = (frequency: number, startTime: number, duration: number, fadeOut: boolean = true) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        // Gentle volume envelope
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.02); // Softer volume
        
        if (fadeOut) {
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        } else {
          gainNode.gain.setValueAtTime(0.12, startTime + duration);
        }
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      // Play two gentle tones - C5 to G5 (pleasant musical interval)
      const now = audioContext.currentTime;
      playTone(523.25, now, 0.2, false); // C5
      playTone(783.99, now + 0.15, 0.25, true); // G5
      
      // Close audio context after sound is done
      setTimeout(() => {
        audioContext.close().catch(() => {});
      }, 500);
      
      logger.info('Notification sound played successfully');
    } catch (e) {
      logger.error('Could not play notification sound', e as Error);
    }
  };

  const showNotification = async (notification: Notification) => {
    logger.info('Showing notification', { title: notification.title, type: notification.type });
    
    // Add to state
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    
    // Persistir a notificação no banco de dados
    if (user?.id) {
      await handleAsync(
        async () => {
          const { error } = await supabase
            .from('notifications')
            .insert({
              user_id: user.id,
              title: notification.title,
              message: notification.message,
              type: notification.type,
              data: {}
            });
          
          if (error) throw error;
        },
        { action: 'salvar notificação' },
        { severity: 'low', showToast: false }
      );
    }
    
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

  // ... keep existing code (showNotification function)
  
  // Carregar notificações persistidas do banco
  const loadPersistedNotifications = useCallback(async (userId: string) => {
    await handleAsync(
      async () => {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .eq('read', false)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        if (data && data.length > 0) {
          const persistedNotifications = data.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type as 'info' | 'success' | 'warning' | 'error',
            timestamp: new Date(n.created_at),
            read: n.read
          }));
          
          setNotifications(prev => [...persistedNotifications, ...prev]);
          logger.info('Loaded persisted notifications', { count: data.length, userId });
        }
      },
      { action: 'carregar notificações persistidas', userId },
      { severity: 'low', showToast: false }
    );
  }, [handleAsync]);

  // Cleanup function for channels
  const cleanupChannels = useCallback(() => {
    logger.info('Cleaning up notification channels', { count: channelsRef.current.length });
    channelsRef.current.forEach(channel => {
      if (channel) {
        try {
          channel.unsubscribe();
        } catch (e) {
          logger.warn('Error unsubscribing channel', { error: e });
        }
      }
    });
    channelsRef.current = [];
    isSetupRef.current = false;
  }, []);

  // Setup notifications with retry logic
  const setupNotifications = useCallback(async (userId: string) => {
    try {
      logger.info('Setting up notifications for user', { userId });
      
      // Clean up any existing channels first
      channelsRef.current.forEach(channel => {
        if (channel) {
          try {
          channel.unsubscribe();
          } catch (e) {
            logger.warn('Error unsubscribing existing channel', { error: e });
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
            logger.info('Contribution update received', {
              product: payload.new.product_name,
              oldVerified: payload.old.verified,
              newVerified: payload.new.verified
            });
            
            if (payload.new.verified === true && payload.old.verified === false) {
              logger.info('User contribution approved');
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
              logger.info('User contribution rejected');
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
            logger.info('User notifications channel connected');
          } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            logger.error('User channel error', new Error(`Channel status: ${status}`));
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
            logger.info('Suggestion status update received', {
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
            logger.info('User suggestions channel connected');
          } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            logger.error('User suggestions channel error', new Error(`Channel status: ${status}`));
          }
        });

      channelsRef.current.push(userChannel, userSuggestionsChannel);

      // Check if user is admin and setup admin notifications
      const userIsAdmin = await isAdmin(userId);
      
      if (userIsAdmin) {
        logger.info('Setting up admin notifications', { userId });
        
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
                logger.info('New contribution for admin', {
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
              logger.info('Admin contributions channel connected');
            } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
              logger.error('Admin contributions channel error', new Error(`Channel status: ${status}`));
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
                logger.info('New suggestion for admin', {
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
              logger.info('Admin suggestions channel connected');
            } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
              logger.error('Admin suggestions channel error', new Error(`Channel status: ${status}`));
            }
          });

        channelsRef.current.push(adminContributionsChannel, adminSuggestionsChannel);
      }

      isSetupRef.current = true;
    } catch (error) {
      logger.error('Error setting up notifications', error as Error, { userId });
      isSetupRef.current = false;
    }
  }, [handleAsync]);

  useEffect(() => {
    logger.info('useNotifications effect triggered', { userId: user?.id });
    
    if (!user?.id) {
      logger.info('No user, cleaning up channels');
      cleanupChannels();
      currentUserIdRef.current = undefined;
      isSetupRef.current = false;
      return;
    }

    // If user changed, cleanup and reset
    if (currentUserIdRef.current !== user.id) {
      logger.info('User changed, cleaning up and resetting');
      cleanupChannels();
      currentUserIdRef.current = user.id;
      isSetupRef.current = false;
    }

    // Skip if already setup for this user
    if (isSetupRef.current) {
      logger.info('Already setup for this user, skipping');
      return;
    }

    // Setup notifications immediately
    logger.info('Setting up notifications for user', { userId: user.id });
    setupNotifications(user.id);
    
    // Carregar notificações persistidas
    loadPersistedNotifications(user.id);
  }, [user?.id, setupNotifications, loadPersistedNotifications, cleanupChannels]);

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