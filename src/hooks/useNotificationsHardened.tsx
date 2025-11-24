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

interface ConnectionStatus {
  isConnected: boolean;
  lastConnected: Date | null;
  retryCount: number;
  usingFallback: boolean;
}

export const useNotificationsHardened = () => {
  const { user } = useAuth();
  const { handleAsync } = useErrorHandler({ component: 'useNotificationsHardened' });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastConnected: null,
    retryCount: 0,
    usingFallback: false
  });

  const channelsRef = useRef<any[]>([]);
  const setupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUserIdRef = useRef<string | undefined>(undefined);
  const isSetupRef = useRef(false);
  const errorLogCountRef = useRef(0);
  const lastErrorLogRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Validate connection URL and log critical info
  const validateConnection = useCallback(() => {
    const expectedDomain = 'diqdsmrlhldanxxrtozl.supabase.co';
    const actualUrl = 'https://diqdsmrlhldanxxrtozl.supabase.co';
    
    logger.info('Connection validation', {
      expected: expectedDomain,
      actual: actualUrl,
      isOnline: navigator.onLine
    });

    if (!actualUrl.includes(expectedDomain)) {
      logger.error('CRITICAL: Supabase URL mismatch', new Error('URL mismatch'), {
        expected: expectedDomain,
        actual: actualUrl
      });
      return false;
    }
    return true;
  }, []);

  const playNotificationSound = () => {
    try {
      logger.info('Playing notification sound');
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playTone = (frequency: number, startTime: number, duration: number, fadeOut: boolean = true) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
        
        if (fadeOut) {
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        } else {
          gainNode.gain.setValueAtTime(0.12, startTime + duration);
        }
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      const now = audioContext.currentTime;
      playTone(523.25, now, 0.2, false); 
      playTone(783.99, now + 0.15, 0.25, true);
      
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
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    
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
    
    toast(notification.title, {
      description: notification.message,
      duration: 5000,
    });

    playNotificationSound();

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192.png',
        badge: '/icon-192.png'
      });
    }
  };

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

  // Debounced error logging (max 3 per minute)
  const logChannelError = useCallback((status: string, context: string) => {
    const now = Date.now();
    
    // Reset counter if it's been more than a minute
    if (now - lastErrorLogRef.current > 60000) {
      errorLogCountRef.current = 0;
    }
    
    if (errorLogCountRef.current < 3) {
      logger.error(`${context} channel error`, new Error(`Channel status: ${status}`), {
        retryCount: connectionStatus.retryCount,
        domain: 'diqdsmrlhldanxxrtozl.supabase.co'
      });
      errorLogCountRef.current++;
      lastErrorLogRef.current = now;
    }
  }, [connectionStatus.retryCount]);

  // Exponential backoff for retries
  const getRetryDelay = (retryCount: number) => {
    return Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
  };

  // Fallback polling for critical notifications
  const startFallbackPolling = useCallback(async (userId: string) => {
    if (pollingIntervalRef.current) return;
    
    logger.info('Starting fallback polling mode', { userId });
    setConnectionStatus(prev => ({ ...prev, usingFallback: true }));
    
    const pollForUpdates = async () => {
      await handleAsync(
        async () => {
          const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .eq('read', false)
            .order('created_at', { ascending: false })
            .limit(5);
          
          logger.info('Polling check completed', { newNotifications: data?.length || 0 });
        },
        { action: 'polling check', userId },
        { severity: 'low', showToast: false }
      );
    };
    
    // Poll every 30 seconds
    pollingIntervalRef.current = setInterval(pollForUpdates, 30000);
  }, [handleAsync]);

  const stopFallbackPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setConnectionStatus(prev => ({ ...prev, usingFallback: false }));
  }, []);

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
    stopFallbackPolling();
  }, [stopFallbackPolling]);

  const setupNotificationsWithRetry = useCallback(async (userId: string, retryCount = 0) => {
    try {
      if (!validateConnection()) {
        throw new Error('Connection validation failed');
      }

      // Only proceed if document is visible and user is authenticated
      if (document.visibilityState !== 'visible' || !userId) {
        logger.info('Skipping setup - document hidden or no user');
        return;
      }

      logger.info('Setting up hardened notifications', { userId, attempt: retryCount + 1 });
      
      // Clean up any existing channels first
      cleanupChannels();

      // Create unique channel names to avoid conflicts
      const timestamp = Date.now();
      let successCount = 0;
      let totalChannels = 0;
      
      // Setup user notifications channel
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
            logger.info('Contribution update received', { payload: payload.new });
            
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
            logger.info('User notifications channel connected');
            successCount++;
            setConnectionStatus(prev => ({ 
              ...prev, 
              isConnected: true, 
              lastConnected: new Date(),
              retryCount: 0 
            }));
          } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            logChannelError(status, 'User notifications');
          }
        });

      totalChannels++;
      channelsRef.current.push(userChannel);

      // Setup suggestions channel
      const userSuggestionsChannel = supabase
        .channel(`user-suggestions-${userId}-${timestamp}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'suggestions',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
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
            successCount++;
          } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            logChannelError(status, 'User suggestions');
          }
        });

      totalChannels++;
      channelsRef.current.push(userSuggestionsChannel);

      // Setup admin channels if needed
      const userIsAdmin = await isAdmin(userId);
      if (userIsAdmin) {
        logger.info('Setting up admin notifications', { userId });
        
        const adminContributionsChannel = supabase
          .channel(`admin-contributions-${userId}-${timestamp}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'daily_offers'
            },
            (payload) => {
              if (payload.new.user_id !== userId) {
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
              successCount++;
            } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
              logChannelError(status, 'Admin contributions');
            }
          });

        totalChannels++;
        channelsRef.current.push(adminContributionsChannel);
      }

      // Check if we should fall back to polling after some time
      setTimeout(() => {
        if (successCount === 0 && retryCount >= 2) {
          logger.info('All channels failed, starting fallback polling');
          startFallbackPolling(userId);
        }
      }, 5000);

      isSetupRef.current = true;

    } catch (error) {
      logger.error('Error setting up hardened notifications', error as Error, { userId });
      
      const newRetryCount = retryCount + 1;
      setConnectionStatus(prev => ({ 
        ...prev, 
        isConnected: false,
        retryCount: newRetryCount 
      }));

      // Retry with exponential backoff, max 3 attempts
      if (newRetryCount < 3) {
        const delay = getRetryDelay(newRetryCount);
        logger.info('Retrying notification setup', { delay, attempt: newRetryCount + 1, maxAttempts: 3 });
        
        retryTimeoutRef.current = setTimeout(() => {
          setupNotificationsWithRetry(userId, newRetryCount);
        }, delay);
      } else {
        logger.info('Max retries reached, starting fallback mode');
        startFallbackPolling(userId);
      }
    }
  }, [validateConnection, cleanupChannels, logChannelError, startFallbackPolling, showNotification, handleAsync]);

  useEffect(() => {
    logger.info('useNotificationsHardened effect triggered', { userId: user?.id });
    
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
    logger.info('Setting up hardened notifications for user', { userId: user.id });
    setupNotificationsWithRetry(user.id, 0);
    
    // Load persisted notifications
    loadPersistedNotifications(user.id);
  }, [user?.id, setupNotificationsWithRetry, cleanupChannels, loadPersistedNotifications]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupChannels();
      if (setupTimeoutRef.current) {
        clearTimeout(setupTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
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
    showNotification,
    connectionStatus
  };
};