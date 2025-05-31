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

export interface DailyOffer {
  id: string;
  productName: string;
  price: number;
  storeName: string;
  city: string;
  state: string;
  contributorName: string;
  timestamp: Date;
  verified: boolean;
}

export interface PriceContribution {
  productName: string;
  price: number;
  storeName: string;
  city: string;
  state: string;
  quantity: number;
  unit: string;
}

export interface PriceValidationResult {
  isValid: boolean;
  conflictingPrice?: number;
  conflictingContributor?: string;
  priceDifference?: number;
}
