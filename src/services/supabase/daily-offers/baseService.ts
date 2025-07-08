
import { supabase } from '@/integrations/supabase/client';

export const baseDailyOffersService = {
  async checkUserAuthentication(): Promise<{ user: any; error?: string }> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return { user: null, error: 'Usuário não autenticado' };
    }
    return { user };
  },

  async getTodaysDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }
};
