import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
}

export const useSessionTimeout = (options: SessionTimeoutOptions = {}) => {
  const { timeoutMinutes = 120, warningMinutes = 15 } = options;
  const { user, signOut, updateActivity } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const lastActivity = useRef(Date.now());

  const resetTimeout = useCallback(() => {
    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    if (!user) return;

    lastActivity.current = Date.now();
    updateActivity(); // Update activity in database

    // Set warning timeout
    warningRef.current = setTimeout(() => {
      toast.warning(
        `Sua sessão expirará em ${warningMinutes} minutos por inatividade.`,
        {
          duration: 10000,
          action: {
            label: 'Manter conectado',
            onClick: () => resetTimeout()
          }
        }
      );
    }, (timeoutMinutes - warningMinutes) * 60 * 1000);

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      toast.error('Sessão expirada por inatividade. Fazendo logout...');
      signOut();
    }, timeoutMinutes * 60 * 1000);
  }, [user, signOut, updateActivity, timeoutMinutes, warningMinutes]);

  const handleActivity = useCallback(() => {
    if (!user) return;
    
    const now = Date.now();
    // Only reset if last activity was more than 1 minute ago to avoid excessive calls
    if (now - lastActivity.current > 60000) {
      resetTimeout();
    }
  }, [user, resetTimeout]);

  useEffect(() => {
    if (user) {
      resetTimeout();

      // Listen for user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      events.forEach(event => {
        document.addEventListener(event, handleActivity, true);
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleActivity, true);
        });
        
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningRef.current) clearTimeout(warningRef.current);
      };
    }
  }, [user, handleActivity, resetTimeout]);

  return {
    resetTimeout,
    handleActivity
  };
};