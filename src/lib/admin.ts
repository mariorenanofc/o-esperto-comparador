
import { supabase } from "@/integrations/supabase/client";

export const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_user_admin');
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error in isAdmin function:', error);
    return false;
  }
};

export const requireAdmin = async (userId: string | null): Promise<boolean> => {
  if (!userId) return false;
  return await isAdmin(userId);
};
