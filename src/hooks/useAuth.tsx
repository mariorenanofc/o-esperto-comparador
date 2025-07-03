
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  updateActivity: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const updateActivity = async () => {
    if (user) {
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.user_metadata?.full_name || '',
            last_activity: new Date().toISOString(),
            is_online: true
          }, {
            onConflict: 'id'
          });
        console.log('Activity updated for user:', user.id);
      } catch (error) {
        console.error('Error updating activity:', error);
      }
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN' && session?.user) {
          // Defer activity update to prevent potential deadlocks
          setTimeout(() => {
            updateActivity();
          }, 100);
        }

        if (event === 'SIGNED_OUT') {
          // Mark user as offline when signing out
          try {
            await supabase
              .from('profiles')
              .update({ is_online: false })
              .eq('id', session?.user?.id || '');
          } catch (error) {
            console.error('Error marking user offline:', error);
          }
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        setTimeout(() => {
          updateActivity();
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update activity periodically for active users
  useEffect(() => {
    if (user) {
      const interval = setInterval(updateActivity, 5 * 60 * 1000); // Every 5 minutes
      return () => clearInterval(interval);
    }
  }, [user]);

  const value = {
    user,
    session,
    loading,
    updateActivity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
