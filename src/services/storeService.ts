import { supabase } from "@/integrations/supabase/client";

export interface StoreData {
  name: string;
}

export const storeService = {
  async getStores() {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching stores:", error);
      throw error;
    }

    return data || [];
  },

  async createStore(storeData: StoreData) {
    const { data, error } = await supabase
      .from("stores")
      .insert(storeData)
      .select()
      .single();

    if (error) {
      console.error("Error creating store:", error);
      throw error;
    }

    return data;
  },

  async updateStore(id: string, storeData: Partial<StoreData>) {
    const { data, error } = await supabase
      .from("stores")
      .update(storeData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating store:", error);
      throw error;
    }

    return data;
  },

  async deleteStore(id: string) {
    const { error } = await supabase.from("stores").delete().eq("id", id);

    if (error) {
      console.error("Error deleting store:", error);
      throw error;
    }
  },
};
