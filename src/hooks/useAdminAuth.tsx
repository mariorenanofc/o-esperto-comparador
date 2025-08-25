
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
        // Use secure RPC call to check admin status
        const { data: isUserAdmin, error } = await supabase.rpc('is_user_admin');
        
        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!isUserAdmin);
        }
      } catch (error) {
        console.error('Error in checkAdminStatus:', error);
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
      // Use secure RPC call to check admin status
      const { data: isUserAdmin, error } = await supabase.rpc('is_user_admin');
      
      if (error) {
        console.error('Error refreshing admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!isUserAdmin);
      }
    } catch (error) {
      console.error('Error in refreshAdminStatus:', error);
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
