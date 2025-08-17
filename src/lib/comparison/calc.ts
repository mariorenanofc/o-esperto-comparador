import { Product, Store } from "@/lib/types";

export type TotalsByStore = Record<string, number>;

export function calculateTotalsByStore(products: Product[], stores: Store[]): TotalsByStore {
  const totals: TotalsByStore = {};
  for (const store of stores) {
    let total = 0;
    for (const p of products) {
      const price = p.prices[store.id];
      if (typeof price === "number" && !Number.isNaN(price) && price > 0) {
        total += price * (p.quantity ?? 1);
      }
    }
    totals[store.id] = Number(total.toFixed(2));
  }
  return totals;
}

export function calculateOptimalTotal(products: Product[], stores: Store[]): number {
  let total = 0;
  for (const p of products) {
    const prices = stores
      .map((s) => p.prices[s.id])
      .filter((v): v is number => typeof v === "number" && !Number.isNaN(v) && v > 0);
    if (prices.length > 0) {
      const min = Math.min(...prices);
      total += min * (p.quantity ?? 1);
    }
  }
  return Number(total.toFixed(2));
}

export function summarizeTotals(totals: TotalsByStore) {
  const values = Object.values(totals);
  const highest = values.length ? Math.max(...values) : 0;
  const lowest = values.length ? Math.min(...values) : 0;
  const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  return {
    highest: Number(highest.toFixed(2)),
    lowest: Number(lowest.toFixed(2)),
    average: Number(average.toFixed(2)),
  };
}
