import { supabase } from "@/integrations/supabase/client";

export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  total_estimated: number;
  total_savings: number;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListItem {
  id: string;
  list_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  category: string | null;
  best_store: string | null;
  best_price: number | null;
  alternative_store: string | null;
  alternative_price: number | null;
  is_checked: boolean;
  created_at: string;
}

export interface CreateListInput {
  name?: string;
}

export interface AddItemInput {
  product_name: string;
  quantity?: number;
  unit?: string;
  category?: string;
}

export const shoppingListService = {
  async getUserLists(userId: string): Promise<ShoppingList[]> {
    const { data, error } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getActiveList(userId: string): Promise<ShoppingList | null> {
    const { data, error } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async createList(userId: string, input?: CreateListInput): Promise<ShoppingList> {
    const { data, error } = await supabase
      .from("shopping_lists")
      .insert({
        user_id: userId,
        name: input?.name || "Minha Lista",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getListItems(listId: string): Promise<ShoppingListItem[]> {
    const { data, error } = await supabase
      .from("shopping_list_items")
      .select("*")
      .eq("list_id", listId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addItem(listId: string, input: AddItemInput): Promise<ShoppingListItem> {
    // First, find best prices from daily_offers
    const { data: offers } = await supabase
      .from("daily_offers")
      .select("price, store_name")
      .ilike("product_name", `%${input.product_name}%`)
      .order("price", { ascending: true })
      .limit(2);

    const bestOffer = offers?.[0];
    const altOffer = offers?.[1];

    const { data, error } = await supabase
      .from("shopping_list_items")
      .insert({
        list_id: listId,
        product_name: input.product_name,
        quantity: input.quantity || 1,
        unit: input.unit || "un",
        category: input.category,
        best_store: bestOffer?.store_name || null,
        best_price: bestOffer?.price || null,
        alternative_store: altOffer?.store_name || null,
        alternative_price: altOffer?.price || null,
      })
      .select()
      .single();

    if (error) throw error;
    
    // Update list totals
    await this.updateListTotals(listId);
    
    return data;
  },

  async toggleItemChecked(itemId: string, isChecked: boolean): Promise<void> {
    const { error } = await supabase
      .from("shopping_list_items")
      .update({ is_checked: isChecked })
      .eq("id", itemId);

    if (error) throw error;
  },

  async removeItem(itemId: string, listId: string): Promise<void> {
    const { error } = await supabase
      .from("shopping_list_items")
      .delete()
      .eq("id", itemId);

    if (error) throw error;
    await this.updateListTotals(listId);
  },

  async updateListTotals(listId: string): Promise<void> {
    const items = await this.getListItems(listId);
    
    let totalEstimated = 0;
    let totalSavings = 0;

    items.forEach(item => {
      if (item.best_price) {
        totalEstimated += item.best_price * item.quantity;
      }
      if (item.best_price && item.alternative_price) {
        totalSavings += (item.alternative_price - item.best_price) * item.quantity;
      }
    });

    const { error } = await supabase
      .from("shopping_lists")
      .update({
        total_estimated: totalEstimated,
        total_savings: Math.max(0, totalSavings),
        updated_at: new Date().toISOString(),
      })
      .eq("id", listId);

    if (error) throw error;
  },

  async deleteList(listId: string): Promise<void> {
    const { error } = await supabase
      .from("shopping_lists")
      .delete()
      .eq("id", listId);

    if (error) throw error;
  },

  async optimizeList(listId: string): Promise<{ byStore: Record<string, ShoppingListItem[]>; totalSavings: number }> {
    const items = await this.getListItems(listId);
    
    const byStore: Record<string, ShoppingListItem[]> = {};
    let totalSavings = 0;

    items.forEach(item => {
      const store = item.best_store || "Sem loja";
      if (!byStore[store]) {
        byStore[store] = [];
      }
      byStore[store].push(item);
      
      if (item.best_price && item.alternative_price) {
        totalSavings += (item.alternative_price - item.best_price) * item.quantity;
      }
    });

    return { byStore, totalSavings: Math.max(0, totalSavings) };
  },
};
