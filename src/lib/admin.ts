
import { supabase } from "@/integrations/supabase/client";

export const isAdmin = async (userId?: string): Promise<boolean> => {
  try {
    console.log('isAdmin: Checking admin status for userId:', userId);
    
    if (!userId) {
      console.log('isAdmin: No userId provided');
      return false;
    }
    
    // Check user profile directly from profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('isAdmin: Error checking admin status:', error);
      return false;
    }
    
    const result = profile?.plan === 'admin';
    console.log('isAdmin: Result:', result, 'Profile plan:', profile?.plan);
    return result;
  } catch (error) {
    console.error('isAdmin: Error in isAdmin function:', error);
    return false;
  }
};

export const requireAdmin = async (userId: string | null = null): Promise<boolean> => {
  return await isAdmin(userId || undefined);
};
