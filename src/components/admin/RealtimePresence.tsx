import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Activity, 
  Users, 
  Monitor, 
  Smartphone, 
  RefreshCw,
  Clock,
  MapPin
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PresenceUser {
  user_id: string;
  email: string;
  name?: string;
  online_at: string;
  device_type?: string;
  page?: string;
  location?: string;
}

export const RealtimePresence: React.FC = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    // Create admin presence channel
    const adminChannel = supabase.channel('admin_presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

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
        console.log('Admin joined:', key, newPresences);
        // Could show a toast notification here
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Admin left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await trackPresence();
        }
      });

    setChannel(adminChannel);

    // Update presence every 30 seconds
    const interval = setInterval(() => {
      trackPresence();
    }, 30000);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      if (adminChannel) {
        supabase.removeChannel(adminChannel);
      }
    };
  }, [user]);

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
    // In a real app, you might get this from geolocation or user settings
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins Online</p>
                <p className="text-2xl font-bold">{uniqueUsers.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
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
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Tempo Real</span>
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