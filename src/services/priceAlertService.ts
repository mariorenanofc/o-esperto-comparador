import { supabase } from "@/integrations/supabase/client";

export interface PriceAlert {
  id: string;
  user_id: string;
  product_name: string;
  target_price: number;
  current_price: number | null;
  store_name: string | null;
  city: string | null;
  state: string | null;
  is_active: boolean;
  notification_sent: boolean;
  created_at: string;
  triggered_at: string | null;
  updated_at: string;
}

export interface CreatePriceAlertInput {
  product_name: string;
  target_price: number;
  current_price?: number;
  store_name?: string;
  city?: string;
  state?: string;
}

export const priceAlertService = {
  async getUserAlerts(userId: string): Promise<PriceAlert[]> {
    const { data, error } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getActiveAlerts(userId: string): Promise<PriceAlert[]> {
    const { data, error } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createAlert(userId: string, input: CreatePriceAlertInput): Promise<PriceAlert> {
    const { data, error } = await supabase
      .from("price_alerts")
      .insert({
        user_id: userId,
        product_name: input.product_name,
        target_price: input.target_price,
        current_price: input.current_price,
        store_name: input.store_name,
        city: input.city,
        state: input.state,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAlert(alertId: string, updates: Partial<PriceAlert>): Promise<PriceAlert> {
    const { data, error } = await supabase
      .from("price_alerts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", alertId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleAlert(alertId: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from("price_alerts")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", alertId);

    if (error) throw error;
  },

  async deleteAlert(alertId: string): Promise<void> {
    const { error } = await supabase
      .from("price_alerts")
      .delete()
      .eq("id", alertId);

    if (error) throw error;
  },

  async checkForLowerPrices(alert: PriceAlert): Promise<{ found: boolean; price?: number; store?: string }> {
    // Check daily_offers for lower prices
    const { data, error } = await supabase
      .from("daily_offers")
      .select("price, store_name")
      .ilike("product_name", `%${alert.product_name}%`)
      .lte("price", alert.target_price)
      .order("price", { ascending: true })
      .limit(1);

    if (error || !data || data.length === 0) {
      return { found: false };
    }

    return {
      found: true,
      price: data[0].price,
      store: data[0].store_name,
    };
  },
};
