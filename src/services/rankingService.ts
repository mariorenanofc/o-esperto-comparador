import { supabase } from "@/integrations/supabase/client";

export interface StoreRanking {
  store_name: string;
  average_price: number;
  total_products: number;
  savings_percentage: number;
  rank: number;
}

export interface RegionalStats {
  city: string;
  state: string;
  stores: StoreRanking[];
  cheapest_store: string;
  most_expensive_store: string;
  average_savings: number;
}

export const rankingService = {
  async getRegionalRanking(city?: string, state?: string): Promise<RegionalStats | null> {
    let query = supabase
      .from("daily_offers")
      .select("store_name, price, city, state")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (city) {
      query = query.ilike("city", `%${city}%`);
    }
    if (state) {
      query = query.eq("state", state);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return null;
    }

    // Aggregate by store
    const storeData: Record<string, { total: number; count: number }> = {};
    
    data.forEach((offer) => {
      const store = offer.store_name;
      if (!storeData[store]) {
        storeData[store] = { total: 0, count: 0 };
      }
      storeData[store].total += offer.price;
      storeData[store].count += 1;
    });

    // Calculate averages and create rankings
    const stores: StoreRanking[] = Object.entries(storeData)
      .map(([store_name, { total, count }]) => ({
        store_name,
        average_price: total / count,
        total_products: count,
        savings_percentage: 0,
        rank: 0,
      }))
      .sort((a, b) => a.average_price - b.average_price);

    // Calculate savings percentage relative to most expensive
    const maxPrice = stores[stores.length - 1]?.average_price || 0;
    
    stores.forEach((store, index) => {
      store.rank = index + 1;
      store.savings_percentage = maxPrice > 0 
        ? Math.round(((maxPrice - store.average_price) / maxPrice) * 100)
        : 0;
    });

    const avgSavings = stores.length > 1
      ? Math.round(stores.reduce((acc, s) => acc + s.savings_percentage, 0) / stores.length)
      : 0;

    return {
      city: city || data[0]?.city || "Região",
      state: state || data[0]?.state || "",
      stores,
      cheapest_store: stores[0]?.store_name || "",
      most_expensive_store: stores[stores.length - 1]?.store_name || "",
      average_savings: avgSavings,
    };
  },

  async getCitiesWithData(): Promise<{ city: string; state: string; count: number }[]> {
    const { data, error } = await supabase
      .from("daily_offers")
      .select("city, state")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (error || !data) return [];

    // Count by city/state
    const cityCount: Record<string, { city: string; state: string; count: number }> = {};
    
    data.forEach((offer) => {
      const key = `${offer.city}-${offer.state}`;
      if (!cityCount[key]) {
        cityCount[key] = { city: offer.city, state: offer.state, count: 0 };
      }
      cityCount[key].count += 1;
    });

    return Object.values(cityCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  },
};
