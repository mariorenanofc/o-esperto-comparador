
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
        // Check if user profile exists and has admin plan
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('useAdminAuth: Error fetching profile:', profileError);
          setIsAdmin(false);
        } else {
          console.log('useAdminAuth: User profile:', profile);
          const userIsAdmin = profile?.plan === 'admin';
          console.log('useAdminAuth: Is admin?', userIsAdmin);
          setIsAdmin(userIsAdmin);
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
