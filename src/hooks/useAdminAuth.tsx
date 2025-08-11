
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
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('plan, email')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          setIsAdmin(false);
        } else {
          const adminEmails = ['mariovendasonline10k@gmail.com','mariorenan25@gmail.com'];
          const userIsAdmin = profile?.plan === 'admin' || (profile?.email ? adminEmails.includes(profile.email) : false);
          if (userIsAdmin && profile?.plan !== 'admin') {
            await supabase.from('profiles').update({ plan: 'admin' }).eq('id', user.id);
          }
          setIsAdmin(userIsAdmin);
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setIsLoaded(true);
      }
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading]);

  // Add a refresh function to force re-check admin status
  const refreshAdminStatus = async () => {
    if (!user) return;
    
    setIsLoaded(false);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('plan, email')
        .eq('id', user.id)
        .maybeSingle();

      if (!profileError && profile) {
        const adminEmails = ['mariovendasonline10k@gmail.com','mariorenan25@gmail.com'];
        const userIsAdmin = profile.plan === 'admin' || (profile.email ? adminEmails.includes(profile.email) : false);
        setIsAdmin(userIsAdmin);
        if (userIsAdmin && profile.plan !== 'admin') {
          await supabase.from('profiles').update({ plan: 'admin' }).eq('id', user.id);
        }
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
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
