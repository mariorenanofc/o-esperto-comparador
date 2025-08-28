import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { supabase } from '@/integrations/supabase/client';

interface SecurityContextType {
  isSecurityEnabled: boolean;
  sessionTimeoutMinutes: number;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
  sessionTimeoutMinutes?: number;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({
  children,
  sessionTimeoutMinutes = 120
}) => {
  const { user } = useAuth();
  
  // Initialize session timeout
  useSessionTimeout({
    timeoutMinutes: sessionTimeoutMinutes,
    warningMinutes: 15
  });

  // Cleanup expired sessions periodically
  useEffect(() => {
    if (!user) return;

    const cleanupInterval = setInterval(async () => {
      try {
        await supabase.rpc('cleanup_expired_sessions');
      } catch (error) {
        console.error('Session cleanup error:', error);
      }
    }, 15 * 60 * 1000); // Every 15 minutes

    return () => clearInterval(cleanupInterval);
  }, [user]);

  // Monitor for suspicious activity
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // User returned to tab, update activity
        const { updateActivity } = useAuth();
        updateActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const value: SecurityContextType = {
    isSecurityEnabled: true,
    sessionTimeoutMinutes
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};