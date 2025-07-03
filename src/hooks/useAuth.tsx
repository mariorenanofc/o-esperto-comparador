
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { PlanTier } from '@/lib/plans';

interface Profile {
  id: string;
  email: string;
  name: string | null;
  plan: PlanTier;
  created_at: string;
  updated_at: string;
  last_activity?: string | null;
  is_online?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  updateActivity: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user) {
          // Defer profile fetch to avoid deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          // Marcar usuário como offline ao sair
          if (profile?.id) {
            updateUserOfflineStatus(profile.id);
          }
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Atualizar atividade periodicamente enquanto o usuário estiver ativo
  useEffect(() => {
    if (user && profile) {
      const interval = setInterval(() => {
        updateActivity();
      }, 60000); // A cada 1 minuto

      return () => clearInterval(interval);
    }
  }, [user, profile]);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          console.log('Profile not found, it should be created by trigger');
        }
      } else if (data) {
        console.log('Profile fetched:', data);
        // Cast plan to PlanTier safely
        const profileData: Profile = {
          ...data,
          plan: (data.plan as PlanTier) || 'free'
        };
        setProfile(profileData);
        
        // Marcar usuário como online ao carregar perfil
        updateUserOnlineStatus(userId);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserOnlineStatus = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ 
          is_online: true, 
          last_activity: new Date().toISOString() 
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  const updateUserOfflineStatus = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ is_online: false })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating offline status:', error);
    }
  };

  const updateActivity = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ 
          last_activity: new Date().toISOString(),
          is_online: true 
        })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    
    try {
      console.log('Initiating Google sign in...');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) {
        console.error('Google sign in error:', error);
      }
      
      setLoading(false);
      return { error };
    } catch (err) {
      console.error('Unexpected error during Google sign in:', err);
      setLoading(false);
      return { error: err };
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    // Marcar como offline antes de sair
    if (user?.id) {
      await updateUserOfflineStatus(user.id);
    }
    
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }

    return { error };
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signInWithGoogle,
    signOut,
    updateProfile,
    updateActivity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
