
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
        // Force a fresh fetch without cache
        console.log('useAdminAuth: Making query to profiles table for user:', user.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('plan, email')
          .eq('id', user.id)
          .maybeSingle();

        console.log('useAdminAuth: Raw profile data:', profile);
        console.log('useAdminAuth: Profile error:', profileError);

        if (profileError) {
          console.error('useAdminAuth: Error fetching profile:', profileError);
          setIsAdmin(false);
        } else {
          console.log('useAdminAuth: User profile:', profile);
          console.log('useAdminAuth: Profile plan value:', profile?.plan);
          console.log('useAdminAuth: Plan comparison (plan === "admin"):', profile?.plan === 'admin');
          const adminEmails = ['mariovendasonline10k@gmail.com','mariorenan25@gmail.com'];
          const userIsAdmin = profile?.plan === 'admin' || (profile?.email ? adminEmails.includes(profile.email) : false);
          if (userIsAdmin && profile?.plan !== 'admin') {
            console.log('useAdminAuth: Updating profile plan to admin due to whitelisted email');
            await supabase.from('profiles').update({ plan: 'admin' }).eq('id', user.id);
          }
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

  // Add a refresh function to force re-check admin status
  const refreshAdminStatus = async () => {
    if (!user) return;
    
    console.log('useAdminAuth: Manual refresh for user:', user.id);
    setIsLoaded(false);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('plan, email')
        .eq('id', user.id)
        .maybeSingle();

      console.log('useAdminAuth: Manual refresh - Raw profile data:', profile);
      console.log('useAdminAuth: Manual refresh - Profile error:', profileError);

      if (!profileError && profile) {
        console.log('useAdminAuth: Manual refresh - Profile plan value:', profile.plan);
        console.log('useAdminAuth: Manual refresh - Profile email value:', profile.email);
        const adminEmails = ['mariovendasonline10k@gmail.com','mariorenan25@gmail.com'];
        const userIsAdmin = profile.plan === 'admin' || (profile.email ? adminEmails.includes(profile.email) : false);
        console.log('useAdminAuth: Refreshed admin status:', userIsAdmin);
        setIsAdmin(userIsAdmin);
        if (userIsAdmin && profile.plan !== 'admin') {
          console.log('useAdminAuth: Manual refresh - Updating profile plan to admin due to whitelisted email');
          await supabase.from('profiles').update({ plan: 'admin' }).eq('id', user.id);
        }
      } else {
        console.log('useAdminAuth: Manual refresh - Setting admin to false due to error or no profile');
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('useAdminAuth: Error refreshing admin status:', error);
      setIsAdmin(false);
    } finally {
      setIsLoaded(true);
    }
  };
  
  console.log('useAdminAuth: Current state - isAdmin:', isAdmin, 'isLoaded:', isLoaded, 'loading:', loading);
  
  return {
    isAdmin,
    isLoaded: isLoaded && !loading,
    user,
    refreshAdminStatus
  };
};
