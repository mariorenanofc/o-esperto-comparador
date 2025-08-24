
import { supabase } from "@/integrations/supabase/client";

export const isAdmin = async (userId?: string): Promise<boolean> => {
  try {
    if (!userId) {
      return false;
    }
    
    // Use secure RPC call that enforces proper access control
    const { data: isUserAdmin, error } = await supabase.rpc('check_user_admin_status', { 
      user_uuid: userId 
    });
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return !!isUserAdmin;
  } catch (error) {
    console.error('Error in isAdmin function:', error);
    return false;
  }
};

export const requireAdmin = async (userId: string | null = null): Promise<boolean> => {
  return await isAdmin(userId || undefined);
};
