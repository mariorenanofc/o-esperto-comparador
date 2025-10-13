import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { PlanTier } from "@/lib/plans";
import { analytics } from '@/lib/analytics';
import { errorHandler } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  plan: PlanTier | null;
  created_at: string | null;
  updated_at: string | null;
  last_activity: string | null;
  is_online: boolean | null;
  comparisons_made_this_month: number | null;
  last_comparison_reset_month: number | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  updateActivity: () => void;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: unknown }>;
  signInWithGoogleWithRedirect: (redirectPath: string) => Promise<{ error: unknown }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: unknown }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    await errorHandler.retry(
      async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) throw error;

        setProfile(data as UserProfile);
        logger.info('Profile fetched successfully', { userId });
      },
      3, // 3 retry attempts
      1000, // 1s delay
      { component: 'useAuth', action: 'fetchProfile', userId }
    );
  };

  const updateActivity = async () => {
    if (user) {
      await errorHandler.retry(
        async () => {
          await supabase.from("profiles").upsert(
            {
              id: user.id,
              email: user.email || "",
              name:
                user.user_metadata?.name || user.user_metadata?.full_name || "",
              last_activity: new Date().toISOString(),
              is_online: true,
            },
            {
              onConflict: "id",
            }
          );
          logger.debug('Activity updated', { userId: user.id });
        },
        2, // 2 retry attempts
        1000, // 1s delay
        { component: 'useAuth', action: 'updateActivity', userId: user.id }
      );
    }
  };

  const signOut = async () => {
    await errorHandler.handleAsync(
      async () => {
        // Track logout before signing out
        await analytics.trackUserAction('logout');
        
        // Mark user as offline before signing out
        if (user) {
          await supabase
            .from("profiles")
            .update({ is_online: false })
            .eq("id", user.id);
        }

        // Import and use robust sign out
        const { robustSignOut } = await import('@/lib/authCleanup');
        await robustSignOut();
        
        logger.info('User signed out successfully', { userId: user?.id });
      },
      { component: 'useAuth', action: 'signOut', userId: user?.id },
      { 
        showToast: false, // Don't show toast on error, just force redirect
        retry: { enabled: true, maxAttempts: 1 }
      }
    ).catch(() => {
      // Force reload even if there's an error
      logger.warn('Sign out failed, forcing redirect');
      window.location.href = '/';
    });
  };

  const signInWithGoogle = async () => {
    return signInWithGoogleWithRedirect("/");
  };

  const signInWithGoogleWithRedirect = async (redirectPath: string) => {
    const result = await errorHandler.retry(
      async () => {
        // Prepare for sign in by cleaning up existing state
        const { prepareForSignIn } = await import('@/lib/authCleanup');
        await prepareForSignIn();

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}${redirectPath}`,
          },
        });

        if (error) throw error;

        // Track Google sign-in attempt
        await analytics.trackUserAction('login', {
          loginMethod: 'google_oauth',
          redirectPath
        });
        
        logger.info('Google sign-in initiated', { redirectPath });

        return { error: null };
      },
      2, // 2 retry attempts
      2000, // 2s delay
      { component: 'useAuth', action: 'signInWithGoogle', metadata: { redirectPath } }
    );

    return { error: result ? null : new Error('Sign in failed') };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      logger.warn('Attempted to update profile without user');
      return { error: "No user logged in" };
    }

    const result = await errorHandler.retry(
      async () => {
        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id);

        if (error) throw error;

        // Update local profile state
        setProfile((prev) => (prev ? { ...prev, ...updates } : null));
        
        logger.info('Profile updated successfully', { 
          userId: user.id, 
          updatedFields: Object.keys(updates) 
        });
        
        return { error: null };
      },
      3, // 3 retry attempts
      1000, // 1s delay
      { component: 'useAuth', action: 'updateProfile', userId: user.id }
    );

    return result ? { error: null } : { error: 'Update failed after retries' };
  };

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.debug("Auth state changed", { event, userId: session?.user?.id });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN" && session?.user) {
        // Defer activity update and profile fetch to prevent potential deadlocks
        setTimeout(() => {
          updateActivity();
          fetchProfile(session.user.id);
        }, 0);
      }

      if (event === "SIGNED_OUT") {
        setProfile(null);
      }
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        setTimeout(() => {
          updateActivity();
          fetchProfile(session.user.id);
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update activity more frequently for active users
  useEffect(() => {
    if (user) {
      const interval = setInterval(updateActivity, 2 * 60 * 1000); // Every 2 minutes instead of 5
      return () => clearInterval(interval);
    }
  }, [user]);

  const value = {
    user,
    session,
    profile,
    loading,
    updateActivity,
    signOut,
    signInWithGoogle,
    signInWithGoogleWithRedirect,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
