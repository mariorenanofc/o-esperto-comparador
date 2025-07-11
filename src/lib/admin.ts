
import { supabase } from "@/integrations/supabase/client";

export const isAdmin = async (userId?: string): Promise<boolean> => {
  try {
    console.log('isAdmin: Checking admin status...');
    const { data, error } = await supabase.rpc('is_user_admin');
    
    if (error) {
      console.error('isAdmin: Error checking admin status:', error);
      return false;
    }
    
    console.log('isAdmin: Result:', data);
    return data || false;
  } catch (error) {
    console.error('isAdmin: Error in isAdmin function:', error);
    return false;
  }
};

export const requireAdmin = async (userId: string | null = null): Promise<boolean> => {
  return await isAdmin();
};
