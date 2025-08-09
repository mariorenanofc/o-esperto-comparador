// Auth state cleanup utility to prevent authentication limbo states
import { supabase } from '@/integrations/supabase/client';

export const cleanupAuthState = () => {
  try {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });

    // Remove from sessionStorage if exists
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }

    console.log('Auth state cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up auth state:', error);
  }
};

export const robustSignOut = async () => {
  try {
    // Step 1: Clean up auth state first
    cleanupAuthState();
    
    // Step 2: Attempt global sign out (fallback if it fails)
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.warn('Global sign out failed, continuing with cleanup:', err);
    }
    
    // Step 3: Force page reload for completely clean state
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  } catch (error) {
    console.error('Error in robust sign out:', error);
    // Force reload even if there's an error
    window.location.href = '/';
  }
};

export const prepareForSignIn = async () => {
  try {
    // Clean up existing state before signing in
    cleanupAuthState();
    
    // Attempt to sign out any existing session
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
      console.warn('Pre-signin cleanup failed, continuing:', err);
    }
  } catch (error) {
    console.error('Error preparing for sign in:', error);
  }
};