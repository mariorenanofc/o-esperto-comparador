import React from 'react';
import { NotificationBell } from '@/components/NotificationBell';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useMobileDetection } from '@/hooks/useMobileDetection';

export const NotificationSystemEnhanced: React.FC = () => {
  const { user } = useAuth();
  const { isMobile } = useMobileDetection();
  
  // Initialize notifications hook to set up real-time listeners
  useNotifications();

  // Only show notifications if user is logged in
  if (!user) {
    return null;
  }

  return (
    <div className={`fixed z-[9999] ${
      isMobile 
        ? 'top-4 right-4' 
        : 'top-6 right-6'
    }`}>
      <NotificationBell />
    </div>
  );
};