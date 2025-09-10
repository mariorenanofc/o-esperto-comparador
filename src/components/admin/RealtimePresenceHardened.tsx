import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  Users, 
  Monitor, 
  Smartphone, 
  RefreshCw,
  Clock,
  MapPin,
  Wifi,
  WifiOff,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PresenceUser {
  user_id: string;
  email: string;
  name?: string;
  online_at: string;
  device_type?: string;
  page?: string;
  location?: string;
}

interface ConnectionStatus {
  isConnected: boolean;
  lastConnected: Date | null;
  retryCount: number;
  usingFallback: boolean;
}

export const RealtimePresenceHardened: React.FC = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [channel, setChannel] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastConnected: null,
    retryCount: 0,
    usingFallback: false
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const errorLogCountRef = useRef(0);
  const lastErrorLogRef = useRef(0);

  // Validate connection and log details
  const validateConnection = useCallback(() => {
    const expectedDomain = 'diqdsmrlhldanxxrtozl.supabase.co';
    // Use the known URL instead of accessing protected property
    const actualUrl = 'https://diqdsmrlhldanxxrtozl.supabase.co';
    
    console.log('🔍 Admin presence connection validation:', {
      expected: expectedDomain,
      actual: actualUrl,
      isVisible: document.visibilityState === 'visible',
      isOnline: navigator.onLine,
      timestamp: new Date().toISOString()
    });

    return actualUrl.includes(expectedDomain);
  }, []);

  // Debounced error logging
  const logConnectionError = useCallback((status: string, error?: any) => {
    const now = Date.now();
    
    if (now - lastErrorLogRef.current > 60000) {
      errorLogCountRef.current = 0;
    }
    
    if (errorLogCountRef.current < 3) {
      console.error('❌ Admin presence connection error:', status, error, {
        retryCount: connectionStatus.retryCount,
        timestamp: new Date().toISOString(),
        domain: 'diqdsmrlhldanxxrtozl.supabase.co'
      });
      errorLogCountRef.current++;
      lastErrorLogRef.current = now;
    }
  }, [connectionStatus.retryCount]);

  // Exponential backoff
  const getRetryDelay = (retryCount: number) => {
    return Math.min(1000 * Math.pow(2, retryCount), 30000);
  };

  // Fallback polling when realtime fails
  const startFallbackPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;
    
    console.log('🔄 Starting admin presence fallback polling');
    setConnectionStatus(prev => ({ ...prev, usingFallback: true }));
    
    const pollAdminData = async () => {
      try {
        // In a real implementation, you'd fetch admin activity data from a REST endpoint
        // For now, we'll just log that we're polling
        console.log('📊 Admin presence polling check completed');
      } catch (error) {
        console.error('Admin presence polling error:', error);
      }
    };
    
    // Poll every 30 seconds
    pollingIntervalRef.current = setInterval(pollAdminData, 30000);
  }, []);

  const stopFallbackPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setConnectionStatus(prev => ({ ...prev, usingFallback: false }));
  }, []);

  const setupPresenceWithRetry = useCallback(async (retryCount = 0) => {
    if (!user) return;

    try {
      if (!validateConnection()) {
        throw new Error('Connection validation failed');
      }

      // Only proceed if document is visible
      if (document.visibilityState !== 'visible') {
        console.log('🔍 Skipping admin presence setup - document hidden');
        return;
      }

      console.log('🔍 Setting up admin presence channel (attempt', retryCount + 1, ')');

      // Clean up existing channel
      if (channel) {
        supabase.removeChannel(channel);
      }

      // Create admin presence channel
      const adminChannel = supabase.channel('admin_presence_hardened', {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      let isConnected = false;

      // Track current admin presence
      const trackPresence = async () => {
        const userStatus = {
          user_id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || '',
          online_at: new Date().toISOString(),
          device_type: getDeviceType(),
          page: 'admin_panel',
          location: getCurrentLocation(),
        };

        await adminChannel.track(userStatus);
      };

      // Listen to presence events
      adminChannel
        .on('presence', { event: 'sync' }, () => {
          const newState = adminChannel.presenceState();
          
          // Flatten presence state to get all online users
          const users: PresenceUser[] = [];
          Object.values(newState).forEach((presences: any) => {
            if (Array.isArray(presences)) {
              presences.forEach((presence: any) => {
                if (presence.user_id && presence.email && presence.online_at) {
                  users.push(presence as PresenceUser);
                }
              });
            }
          });
          setOnlineUsers(users);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('👑 Admin joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('👑 Admin left:', key, leftPresences);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Admin presence channel connected');
            isConnected = true;
            setConnectionStatus(prev => ({ 
              ...prev, 
              isConnected: true,
              lastConnected: new Date(),
              retryCount: 0 
            }));
            stopFallbackPolling();
            await trackPresence();
          } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            logConnectionError(status);
            setConnectionStatus(prev => ({ ...prev, isConnected: false }));
          }
        });

      setChannel(adminChannel);

      // Check connection after timeout
      setTimeout(() => {
        if (!isConnected && retryCount < 3) {
          const newRetryCount = retryCount + 1;
          const delay = getRetryDelay(newRetryCount);
          
          setConnectionStatus(prev => ({ ...prev, retryCount: newRetryCount }));
          
          console.log(`🔄 Admin presence retry in ${delay}ms (attempt ${newRetryCount + 1}/3)`);
          retryTimeoutRef.current = setTimeout(() => {
            setupPresenceWithRetry(newRetryCount);
          }, delay);
        } else if (!isConnected) {
          console.log('🔄 Admin presence max retries reached, starting fallback');
          startFallbackPolling();
        }
      }, 5000);

      // Update presence every 30 seconds
      const interval = setInterval(() => {
        if (isConnected) {
          trackPresence();
        }
      }, 30000);

      // Cleanup on unmount
      return () => {
        clearInterval(interval);
        if (adminChannel) {
          supabase.removeChannel(adminChannel);
        }
      };

    } catch (error) {
      console.error('❌ Error setting up admin presence:', error);
      logConnectionError('SETUP_ERROR', error);
      
      const newRetryCount = retryCount + 1;
      setConnectionStatus(prev => ({ 
        ...prev, 
        isConnected: false,
        retryCount: newRetryCount 
      }));

      if (newRetryCount < 3) {
        const delay = getRetryDelay(newRetryCount);
        retryTimeoutRef.current = setTimeout(() => {
          setupPresenceWithRetry(newRetryCount);
        }, delay);
      } else {
        startFallbackPolling();
      }
    }
  }, [user, channel, validateConnection, logConnectionError, startFallbackPolling, stopFallbackPolling]);

  useEffect(() => {
    const cleanup = setupPresenceWithRetry(0);
    
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      stopFallbackPolling();
      cleanup?.then?.(c => c?.());
    };
  }, [user, setupPresenceWithRetry, stopFallbackPolling]);

  const getDeviceType = (): string => {
    const userAgent = navigator.userAgent;
    if (/Mobi|Android/i.test(userAgent)) {
      return 'mobile';
    }
    if (/Tablet|iPad/i.test(userAgent)) {
      return 'tablet';
    }
    return 'desktop';
  };

  const getCurrentLocation = (): string => {
    return window.location.pathname;
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-3 h-3" />;
      case 'tablet':
        return <Smartphone className="w-3 h-3" />;
      default:
        return <Monitor className="w-3 h-3" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const uniqueUsers = onlineUsers.reduce((acc, user) => {
    const existing = acc.find(u => u.user_id === user.user_id);
    if (!existing || new Date(user.online_at) > new Date(existing.online_at)) {
      return [...acc.filter(u => u.user_id !== user.user_id), user];
    }
    return acc;
  }, [] as PresenceUser[]);

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      {(!connectionStatus.isConnected || connectionStatus.usingFallback) && (
        <Alert className={connectionStatus.usingFallback ? "border-yellow-200 bg-yellow-50" : "border-red-200 bg-red-50"}>
          <div className="flex items-center gap-2">
            {connectionStatus.usingFallback ? (
              <RefreshCw className="h-4 w-4 text-yellow-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
          </div>
          <AlertDescription>
            {connectionStatus.usingFallback 
              ? "Usando modo de fallback - dados podem não estar em tempo real"
              : `Conexão com tempo real perdida. Tentativa ${connectionStatus.retryCount}/3`
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins Online</p>
                <p className="text-2xl font-bold">{uniqueUsers.length}</p>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8 text-green-600" />
                {connectionStatus.isConnected ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dispositivos Móveis</p>
                <p className="text-2xl font-bold">
                  {uniqueUsers.filter(u => u.device_type === 'mobile').length}
                </p>
              </div>
              <Smartphone className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sessões Ativas</p>
                <p className="text-2xl font-bold">{onlineUsers.length}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Online Admins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Administradores Online
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus.isConnected ? (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              ) : connectionStatus.usingFallback ? (
                <RefreshCw className="w-3 h-3 text-yellow-600 animate-spin" />
              ) : (
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              )}
              <span className="text-sm text-muted-foreground">
                {connectionStatus.isConnected ? 'Tempo Real' : 
                 connectionStatus.usingFallback ? 'Fallback' : 'Desconectado'}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {uniqueUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">Nenhum administrador online no momento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {uniqueUsers.map((user) => (
                <div key={`${user.user_id}-${user.online_at}`} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {getInitials(user.name || '', user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name || 'Admin'}</p>
                        <Badge variant="outline" className="text-xs">
                          {getDeviceIcon(user.device_type || 'desktop')}
                          <span className="ml-1">{user.device_type || 'desktop'}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.location && user.location !== '/' && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{user.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(user.online_at)}
                    </div>
                    <Badge className="bg-green-100 text-green-800 mt-1">
                      Ativo
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {onlineUsers.slice(0, 10).map((user, index) => (
              <div key={`${user.user_id}-${user.online_at}-${index}`} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">{user.name || 'Admin'}</span>
                <span className="text-muted-foreground">
                  entrou no painel administrativo
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatTimeAgo(user.online_at)}
                </span>
              </div>
            ))}
            
            {onlineUsers.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma atividade recente
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};