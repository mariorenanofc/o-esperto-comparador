
export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  prices: { [storeId: string]: number };
}

export interface Store {
  id: string;
  name: string;
}

export interface ComparisonData {
  products: Product[];
  stores: Store[];
  date?: Date;
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalSpent: number;
  comparisons: ComparisonData[];
}

export interface ProductFormData {
  name: string;
  quantity: number;
  unit: string;
  prices: { [storeId: string]: number };
}
