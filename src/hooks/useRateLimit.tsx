import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RateLimitOptions {
  maxAttempts?: number;
  windowMinutes?: number;
  blockMinutes?: number;
}

export const useRateLimit = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const checkRateLimit = useCallback(async (
    endpoint: string, 
    options: RateLimitOptions = {}
  ): Promise<boolean> => {
    const {
      maxAttempts = 10,
      windowMinutes = 60,
      blockMinutes = 30
    } = options;

    try {
      const { data: allowed, error } = await supabase.rpc('check_rate_limit', {
        endpoint_name: endpoint,
        max_attempts: maxAttempts,
        window_minutes: windowMinutes,
        block_minutes: blockMinutes
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Allow on error to prevent blocking legitimate users
      }

      if (!allowed) {
        setIsBlocked(true);
        toast.error(
          `Muitas tentativas. Tente novamente em ${blockMinutes} minutos.`,
          {
            duration: 5000,
          }
        );
        return false;
      }

      setIsBlocked(false);
      return true;
    } catch (error) {
      console.error('Rate limit error:', error);
      return true; // Allow on error
    }
  }, []);

  const resetRateLimit = useCallback(() => {
    setIsBlocked(false);
    setAttempts(0);
  }, []);

  return {
    checkRateLimit,
    isBlocked,
    attempts,
    resetRateLimit
  };
};