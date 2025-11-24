
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export const useAdminAuth = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoaded(true);
        return;
      }

      try {
        // Use secure authenticated RPC call to check admin status
        const { data: isUserAdmin, error } = await supabase.rpc('check_admin_with_auth');
        
        if (error) {
          logger.error('Error checking admin status', error, { userId: user?.id });
          setIsAdmin(false);
        } else {
          setIsAdmin(!!isUserAdmin);
        }
      } catch (error) {
        logger.error('Error in checkAdminStatus', error as Error, { userId: user?.id });
        setIsAdmin(false);
      } finally {
        setIsLoaded(true);
      }
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading]);

  // Refresh function only re-checks, no client-side promotion
  const refreshAdminStatus = async () => {
    if (!user) return;
    
    setIsLoaded(false);
    try {
      // Use secure authenticated RPC call to check admin status
      const { data: isUserAdmin, error } = await supabase.rpc('check_admin_with_auth');
      
      if (error) {
        logger.error('Error refreshing admin status', error, { userId: user?.id });
        setIsAdmin(false);
      } else {
        setIsAdmin(!!isUserAdmin);
      }
    } catch (error) {
      logger.error('Error in refreshAdminStatus', error as Error, { userId: user?.id });
      setIsAdmin(false);
    } finally {
      setIsLoaded(true);
    }
  };
  
  
  
  return {
    isAdmin,
    isLoaded: isLoaded && !loading,
    user,
    refreshAdminStatus
  };
};
