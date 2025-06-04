
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
  id: string;
  user_id: string;
  month: string;
  year: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
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
  userId: string;
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
  message?: string;
}

// Tipos específicos do Supabase
export interface Profile {
  id: string;
  email: string;
  name: string | null;
  plan: 'free' | 'premium' | 'pro' | 'empresarial';
  created_at: string;
  updated_at: string;
}

export interface Comparison {
  id: string;
  user_id: string;
  title: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Suggestion {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'improvement' | 'feature' | 'bug' | 'other';
  status: 'open' | 'in-review' | 'implemented' | 'closed';
  created_at: string;
  updated_at: string;
}
