import React, { useState } from 'react';
import { NotificationBell } from '@/components/NotificationBell';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

export const NotificationSystemEnhanced: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [showCenter, setShowCenter] = useState(false);
  
  // Initialize notifications hook to set up real-time listeners
  useNotifications();

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
        <NotificationBell onOpenCenter={() => setShowCenter(true)} />
      </div>
      
      <NotificationCenter 
        isOpen={showCenter} 
        onClose={() => setShowCenter(false)} 
      />
    </>
  );
};