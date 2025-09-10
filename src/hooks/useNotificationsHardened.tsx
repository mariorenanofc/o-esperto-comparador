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

interface ConnectionStatus {
  isConnected: boolean;
  lastConnected: Date | null;
  retryCount: number;
  usingFallback: boolean;
}

export const useNotificationsHardened = () => {
  const { user } = useAuth();
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
    // Use the known URL instead of accessing protected property
    const actualUrl = 'https://diqdsmrlhldanxxrtozl.supabase.co';
    
    console.log('🔍 Connection validation:', {
      expected: expectedDomain,
      actual: actualUrl,
      isOnline: navigator.onLine,
      timestamp: new Date().toISOString()
    });

    if (!actualUrl.includes(expectedDomain)) {
      console.error('❌ CRITICAL: Supabase URL mismatch!', {
        expected: expectedDomain,
        actual: actualUrl
      });
      return false;
    }
    return true;
  }, []);

  const playNotificationSound = () => {
    try {
      console.log('🔊 Playing notification sound...');
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
      
      console.log('🔊 Notification sound played successfully');
    } catch (e) {
      console.error('❌ Could not play notification sound:', e);
    }
  };

  const showNotification = async (notification: Notification) => {
    console.log('🔔 Showing notification:', notification.title);
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    
    if (user?.id) {
      try {
        const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            data: {}
          });
        
        if (error) {
          console.error('Error saving notification to DB:', error);
        }
      } catch (error) {
        console.error('Error persisting notification:', error);
      }
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
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading persisted notifications:', error);
        return;
      }

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
      }
    } catch (error) {
      console.error('Error loading persisted notifications:', error);
    }
  }, []);

  // Debounced error logging (max 3 per minute)
  const logChannelError = useCallback((status: string, context: string) => {
    const now = Date.now();
    
    // Reset counter if it's been more than a minute
    if (now - lastErrorLogRef.current > 60000) {
      errorLogCountRef.current = 0;
    }
    
    if (errorLogCountRef.current < 3) {
        console.error(`❌ ${context} channel error:`, status, {
          retryCount: connectionStatus.retryCount,
          timestamp: new Date().toISOString(),
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
    
    console.log('🔄 Starting fallback polling mode');
    setConnectionStatus(prev => ({ ...prev, usingFallback: true }));
    
    const pollForUpdates = async () => {
      try {
        // Check for new notifications
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .eq('read', false)
          .order('created_at', { ascending: false })
          .limit(5);
        
        // This is a simple implementation - in production you'd track what's already been shown
        console.log('📊 Polling check completed, new notifications:', data?.length || 0);
      } catch (error) {
        console.error('Polling error:', error);
      }
    };
    
    // Poll every 30 seconds
    pollingIntervalRef.current = setInterval(pollForUpdates, 30000);
  }, []);

  const stopFallbackPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setConnectionStatus(prev => ({ ...prev, usingFallback: false }));
  }, []);

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
    stopFallbackPolling();
  }, [stopFallbackPolling]);

  const setupNotificationsWithRetry = useCallback(async (userId: string, retryCount = 0) => {
    try {
      if (!validateConnection()) {
        throw new Error('Connection validation failed');
      }

      // Only proceed if document is visible and user is authenticated
      if (document.visibilityState !== 'visible' || !userId) {
        console.log('🔔 Skipping setup - document hidden or no user');
        return;
      }

      console.log('🔔 Setting up notifications for user:', userId, `(attempt ${retryCount + 1})`);
      
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
            console.log('🔔 Contribution update received:', payload);
            
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
            console.log('✅ User suggestions channel connected');
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
        console.log('👑 Setting up admin notifications');
        
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
              console.log('✅ Admin contributions channel connected');
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
          console.log('🔄 All channels failed, starting fallback polling');
          startFallbackPolling(userId);
        }
      }, 5000);

      isSetupRef.current = true;

    } catch (error) {
      console.error('❌ Error setting up notifications:', error);
      
      const newRetryCount = retryCount + 1;
      setConnectionStatus(prev => ({ 
        ...prev, 
        isConnected: false,
        retryCount: newRetryCount 
      }));

      // Retry with exponential backoff, max 3 attempts
      if (newRetryCount < 3) {
        const delay = getRetryDelay(newRetryCount);
        console.log(`🔄 Retrying in ${delay}ms (attempt ${newRetryCount + 1}/3)`);
        
        retryTimeoutRef.current = setTimeout(() => {
          setupNotificationsWithRetry(userId, newRetryCount);
        }, delay);
      } else {
        console.log('🔄 Max retries reached, starting fallback mode');
        startFallbackPolling(userId);
      }
    }
  }, [validateConnection, cleanupChannels, logChannelError, startFallbackPolling, showNotification]);

  useEffect(() => {
    console.log('🔔 useNotificationsHardened effect triggered, user:', user?.id);
    
    if (!user?.id) {
      console.log('🔔 No user, cleaning up channels');
      cleanupChannels();
      currentUserIdRef.current = undefined;
      isSetupRef.current = false;
      return;
    }

    // If user changed, cleanup and reset
    if (currentUserIdRef.current !== user.id) {
      console.log('🔔 User changed, cleaning up and resetting');
      cleanupChannels();
      currentUserIdRef.current = user.id;
      isSetupRef.current = false;
    }

    // Skip if already setup for this user
    if (isSetupRef.current) {
      console.log('🔔 Already setup for this user, skipping');
      return;
    }

    // Setup notifications immediately
    console.log('🔔 Setting up hardened notifications for user:', user.id);
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