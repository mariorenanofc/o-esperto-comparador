import React, { useState } from 'react';
import { NotificationBell } from '@/components/NotificationBell';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { ConnectionStatusIndicator } from '@/components/ConnectionStatusIndicator';
import { useNotificationsHardened } from '@/hooks/useNotificationsHardened';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

export const NotificationSystemEnhanced: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [showCenter, setShowCenter] = useState(false);
  
  // Initialize hardened notifications hook to set up real-time listeners
  const { connectionStatus } = useNotificationsHardened();

  // Only show notifications if user is logged in
  if (!user) {
    return null;
  }

  return (
    <>
      <div className={`fixed z-[9999] ${
        isMobile 
          ? 'top-20 right-4' 
          : 'top-6 right-6'
      }`}>
        <div className="flex flex-col items-end gap-2">
          <NotificationBell onOpenCenter={() => setShowCenter(true)} />
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