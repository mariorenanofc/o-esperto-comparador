
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
        console.log('useAdminAuth: No user found');
        setIsAdmin(false);
        setIsLoaded(true);
        return;
      }

      console.log('useAdminAuth: Checking admin status for user:', user.id);

      try {
        const { data, error } = await supabase.rpc('is_user_admin');
        
        if (error) {
          console.error('useAdminAuth: Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          console.log('useAdminAuth: Admin check result:', data);
          setIsAdmin(data || false);
        }
      } catch (error) {
        console.error('useAdminAuth: Error in admin check:', error);
        setIsAdmin(false);
      } finally {
        setIsLoaded(true);
      }
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading]);
  
  console.log('useAdminAuth: Current state - isAdmin:', isAdmin, 'isLoaded:', isLoaded, 'loading:', loading);
  
  return {
    isAdmin,
    isLoaded: isLoaded && !loading,
    user
  };
};
