import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { isAdmin } from '@/lib/admin';
import { logger } from '@/lib/logger';

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
  isConnecting: boolean;
  lastConnected: Date | null;
  retryCount: number;
  usingFallback: boolean;
}

export const useNotificationsHardened = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isConnecting: true,
    lastConnected: null,
    retryCount: 0,
    usingFallback: false
  });

  // All refs for stable references
  const channelsRef = useRef<any[]>([]);
  const currentUserIdRef = useRef<string | undefined>(undefined);
  const isSetupRef = useRef(false);
  const isMountedRef = useRef(true);
  const errorLogCountRef = useRef(0);
  const lastErrorLogRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const setupInProgressRef = useRef(false);

  // Memoized user ID to prevent re-renders
  const userId = useMemo(() => user?.id, [user?.id]);

  // Play notification sound - stable function
  const playNotificationSound = useCallback(() => {
    try {
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
    } catch (e) {
      // Silent fail for audio
    }
  }, []);

  // Show notification - stable function without external deps
  const showNotification = useCallback((notification: Notification) => {
    if (!isMountedRef.current) return;
    
    setNotifications(prev => {
      // Prevent duplicates
      if (prev.some(n => n.id === notification.id)) return prev;
      return [notification, ...prev.slice(0, 9)];
    });
    
    toast(notification.title, {
      description: notification.message,
      duration: 5000,
    });

    playNotificationSound();

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icon-192.png',
          badge: '/icon-192.png'
        });
      } catch (e) {
        // Silent fail for browser notifications
      }
    }
  }, [playNotificationSound]);

  // Save notification to database - separate from showNotification
  const saveNotificationToDb = useCallback(async (notification: Notification, targetUserId: string) => {
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          data: {}
        });
    } catch (error) {
      logger.error('Failed to save notification', error as Error);
    }
  }, []);

  // Debounced error logging
  const logChannelError = useCallback((status: string, context: string) => {
    const now = Date.now();
    
    if (now - lastErrorLogRef.current > 60000) {
      errorLogCountRef.current = 0;
    }
    
    if (errorLogCountRef.current < 3) {
      logger.warn(`${context} channel status: ${status}`);
      errorLogCountRef.current++;
      lastErrorLogRef.current = now;
    }
  }, []);

  // Stop fallback polling - stable ref
  const stopFallbackPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Cleanup channels - stable function
  const cleanupChannels = useCallback(() => {
    channelsRef.current.forEach(channel => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          // Silent cleanup
        }
      }
    });
    channelsRef.current = [];
    isSetupRef.current = false;
    setupInProgressRef.current = false;
    stopFallbackPolling();
  }, [stopFallbackPolling]);

  // Load persisted notifications
  const loadPersistedNotifications = useCallback(async (targetUserId: string) => {
    if (!isMountedRef.current) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0 && isMountedRef.current) {
        const persistedNotifications = data.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type as 'info' | 'success' | 'warning' | 'error',
          timestamp: new Date(n.created_at),
          read: n.read ?? false
        }));
        
        setNotifications(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newNotifications = persistedNotifications.filter(n => !existingIds.has(n.id));
          return [...newNotifications, ...prev];
        });
      }
    } catch (error) {
      logger.error('Failed to load notifications', error as Error);
    }
  }, []);

  // Start fallback polling
  const startFallbackPolling = useCallback((targetUserId: string) => {
    if (pollingIntervalRef.current) return;
    
    setConnectionStatus(prev => ({ ...prev, usingFallback: true }));
    
    const pollForUpdates = async () => {
      if (!isMountedRef.current) return;
      
      try {
        await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', targetUserId)
          .eq('read', false)
          .limit(1);
      } catch (error) {
        // Silent fail for polling
      }
    };
    
    pollingIntervalRef.current = setInterval(pollForUpdates, 30000);
  }, []);

  // Setup notifications - core logic
  const setupNotifications = useCallback(async (targetUserId: string, retryCount = 0) => {
    // Guard against concurrent setups
    if (setupInProgressRef.current || !isMountedRef.current) return;
    if (document.visibilityState !== 'visible') return;
    
    setupInProgressRef.current = true;
    
    try {
      // Clean up existing channels first
      cleanupChannels();
      
      const timestamp = Date.now();
      let successCount = 0;
      
      // Create user notifications channel
      const userChannel = supabase
        .channel(`user-notifications-${targetUserId}-${timestamp}`, {
          config: { broadcast: { self: false } }
        })
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'daily_offers',
            filter: `user_id=eq.${targetUserId}`
          },
          (payload) => {
            if (!isMountedRef.current) return;
            
            if (payload.new.verified === true && payload.old?.verified === false) {
              const notification: Notification = {
                id: `offer-approved-${Date.now()}`,
                title: 'Contribuição Aprovada! ✅',
                message: `Sua contribuição de ${payload.new.product_name} foi aprovada`,
                type: 'success',
                timestamp: new Date(),
                read: false
              };
              showNotification(notification);
              saveNotificationToDb(notification, targetUserId);
            } else if (payload.new.verified === false && payload.old?.verified === null) {
              const notification: Notification = {
                id: `offer-rejected-${Date.now()}`,
                title: 'Contribuição Rejeitada ❌',
                message: `Sua contribuição de ${payload.new.product_name} foi rejeitada`,
                type: 'error',
                timestamp: new Date(),
                read: false
              };
              showNotification(notification);
              saveNotificationToDb(notification, targetUserId);
            }
          }
        )
        .subscribe((status) => {
          if (!isMountedRef.current) return;
          
          if (status === 'SUBSCRIBED') {
            successCount++;
            setConnectionStatus(prev => ({ 
              ...prev, 
              isConnected: true,
              isConnecting: false,
              lastConnected: new Date(),
              retryCount: 0 
            }));
          } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            logChannelError(status, 'User notifications');
          }
        });

      channelsRef.current.push(userChannel);

      // Create suggestions channel
      const suggestionsChannel = supabase
        .channel(`user-suggestions-${targetUserId}-${timestamp}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'suggestions',
            filter: `user_id=eq.${targetUserId}`
          },
          (payload) => {
            if (!isMountedRef.current) return;
            if (payload.new.status === payload.old?.status) return;
            
            let notificationTitle = '';
            let notificationMessage = '';
            let notificationType: 'info' | 'success' | 'warning' | 'error' = 'info';
            
            switch (payload.new.status) {
              case 'in-review':
                notificationTitle = 'Sugestão em Análise 🔍';
                notificationMessage = `Sua sugestão "${payload.new.title}" está sendo analisada`;
                break;
              case 'implemented':
                notificationTitle = 'Sugestão Implementada! ✅';
                notificationMessage = `Sua sugestão "${payload.new.title}" foi implementada`;
                notificationType = 'success';
                break;
              case 'closed':
                notificationTitle = 'Sugestão Finalizada 📋';
                notificationMessage = `Sua sugestão "${payload.new.title}" foi finalizada`;
                break;
            }
            
            if (notificationTitle) {
              const notification: Notification = {
                id: `suggestion-${payload.new.id}-${Date.now()}`,
                title: notificationTitle,
                message: notificationMessage,
                type: notificationType,
                timestamp: new Date(),
                read: false
              };
              showNotification(notification);
              saveNotificationToDb(notification, targetUserId);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            successCount++;
          } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            logChannelError(status, 'Suggestions');
          }
        });

      channelsRef.current.push(suggestionsChannel);

      // Setup admin channels if user is admin
      const userIsAdmin = await isAdmin(targetUserId);
      if (userIsAdmin && isMountedRef.current) {
        const adminChannel = supabase
          .channel(`admin-contributions-${targetUserId}-${timestamp}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'daily_offers'
            },
            (payload) => {
              if (!isMountedRef.current) return;
              if (payload.new.user_id === targetUserId) return;
              
              const notification: Notification = {
                id: `admin-offer-${payload.new.id}-${Date.now()}`,
                title: 'Nova Contribuição 📝',
                message: `${payload.new.contributor_name}: ${payload.new.product_name} em ${payload.new.store_name}`,
                type: 'info',
                timestamp: new Date(),
                read: false
              };
              showNotification(notification);
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              successCount++;
            } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
              logChannelError(status, 'Admin contributions');
            }
          });

        channelsRef.current.push(adminChannel);
      }

      // Check for fallback after delay
      setTimeout(() => {
        if (successCount === 0 && retryCount >= 2 && isMountedRef.current) {
          startFallbackPolling(targetUserId);
        }
      }, 5000);

      isSetupRef.current = true;
      setupInProgressRef.current = false;

    } catch (error) {
      logger.error('Notification setup failed', error as Error);
      setupInProgressRef.current = false;
      
      const newRetryCount = retryCount + 1;
      
      if (isMountedRef.current) {
        setConnectionStatus(prev => ({ 
          ...prev, 
          isConnected: false,
          isConnecting: false,
          retryCount: newRetryCount 
        }));
      }

      // Retry with exponential backoff, max 3 attempts
      if (newRetryCount < 3 && isMountedRef.current) {
        const delay = Math.min(1000 * Math.pow(2, newRetryCount), 30000);
        
        retryTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setupNotifications(targetUserId, newRetryCount);
          }
        }, delay);
      } else if (isMountedRef.current) {
        startFallbackPolling(targetUserId);
      }
    }
  }, [cleanupChannels, showNotification, saveNotificationToDb, logChannelError, startFallbackPolling]);

  // Main effect - only depends on userId
  useEffect(() => {
    isMountedRef.current = true;
    
    if (!userId) {
      cleanupChannels();
      currentUserIdRef.current = undefined;
      setNotifications([]);
      return;
    }

    // Skip if same user and already setup
    if (currentUserIdRef.current === userId && isSetupRef.current) {
      return;
    }

    // User changed or first setup
    if (currentUserIdRef.current !== userId) {
      cleanupChannels();
      currentUserIdRef.current = userId;
    }

    // Setup notifications
    setupNotifications(userId, 0);
    loadPersistedNotifications(userId);

    return () => {
      isMountedRef.current = false;
      cleanupChannels();
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [userId, cleanupChannels, setupNotifications, loadPersistedNotifications]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    
    // Also update in database
    if (userId) {
      supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .then(() => {});
    }
  }, [userId]);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    
    // Also mark all as read in database
    if (userId) {
      supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .then(() => {});
    }
  }, [userId]);

  // Memoized unread count
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAllNotifications,
    showNotification,
    connectionStatus
  };
};
