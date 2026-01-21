import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { NotificationBell } from '@/components/NotificationBell';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { ConnectionStatusIndicator } from '@/components/ConnectionStatusIndicator';
import { useNotificationsHardened } from '@/hooks/useNotificationsHardened';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

export const NotificationSystemEnhanced: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [showCenter, setShowCenter] = useState(false);
  
  // Initialize hardened notifications hook to set up real-time listeners
  const { notifications, unreadCount, markAsRead, clearAllNotifications, connectionStatus } = useNotificationsHardened();

  // Check if on admin routes - admin has its own layout
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Only show notifications if user is logged in
  if (!user) {
    return null;
  }

  // Don't render notification system on admin routes (AdminLayout handles its own UI)
  if (isAdminRoute) {
    return (
      <NotificationCenter 
        isOpen={showCenter} 
        onClose={() => setShowCenter(false)} 
      />
    );
  }

  return (
    <>
      <div className={`fixed z-[9999] ${
        isMobile 
          ? 'top-20 right-4' 
          : 'top-6 right-6'
      }`}>
        <div className="flex flex-col items-end gap-2">
          <NotificationBell 
            onOpenCenter={() => setShowCenter(true)}
            notifications={notifications}
            unreadCount={unreadCount}
            markAsRead={markAsRead}
            clearAllNotifications={clearAllNotifications}
          />
          <ConnectionStatusIndicator status={connectionStatus} />
        </div>
      </div>
      
      <NotificationCenter 
        isOpen={showCenter} 
        onClose={() => setShowCenter(false)} 
      />
    </>
  );
};
