import { useAuth } from '@/hooks/useAuth';
import { useEffect, useRef } from 'react';

export const useRealTimeUserStatus = () => {
  const { user, updateActivity } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    // Only initialize if user exists and updateActivity is available
    if (!user || !updateActivity) {
      console.log('User or updateActivity not available, skipping status tracking');
      return;
    }

    console.log('Initializing real-time user status tracking for user:', user.id);

    // Update activity immediately
    updateActivity();
    lastActivityRef.current = Date.now();

    // Set up regular activity updates (every 2 minutes)
    intervalRef.current = setInterval(() => {
      if (updateActivity) {
        updateActivity();
        lastActivityRef.current = Date.now();
      }
    }, 2 * 60 * 1000); // 2 minutes

    // Activity detection listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (!updateActivity) return;
      
      const now = Date.now();
      // Only update if more than 30 seconds since last update
      if (now - lastActivityRef.current > 30000) {
        updateActivity();
        lastActivityRef.current = now;
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Visibility change handler
    const handleVisibilityChange = () => {
      if (!document.hidden && updateActivity) {
        updateActivity();
        lastActivityRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      console.log('Cleaning up user status tracking');
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, updateActivity]);

  return {
    isTracking: !!user && !!updateActivity,
    lastActivity: lastActivityRef.current,
  };
};