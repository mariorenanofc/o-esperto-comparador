import React, { useState } from 'react';
import { Bell, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { Badge } from '@/components/ui/badge';

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, clearAllNotifications } = useNotifications();
  const [showPanel, setShowPanel] = useState(false);

  if (notifications.length === 0) return null;

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowPanel(!showPanel)}
        className="relative bg-background/80 backdrop-blur-sm border-border/50 hover:bg-muted/50"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Panel */}
      {showPanel && (
        <div className="absolute top-12 right-0 w-80 max-h-96 bg-background backdrop-blur-sm border border-border/50 rounded-lg shadow-xl z-[9999] overflow-hidden">
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notificações</h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearAllNotifications}
                  className="h-6 w-6"
                  title="Limpar todas"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPanel(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-border/30 hover:bg-muted/50 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-muted/30' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};