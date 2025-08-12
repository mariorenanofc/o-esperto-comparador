import React from 'react';
import { NotificationBell } from '@/components/NotificationBell';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationSystem: React.FC = () => {
  // Initialize notifications hook to set up real-time listeners
  useNotifications();

  return (
    <div className="fixed top-20 right-4 z-[9999] md:top-6 md:right-4">
      <NotificationBell />
    </div>
  );
};