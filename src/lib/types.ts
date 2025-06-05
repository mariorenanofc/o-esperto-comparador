
export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  created_at?: string;
  updated_at?: string;
}

export interface Store {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Price {
  id: string;
  product_id: string;
  store_id: string;
  price: number;
  created_at?: string;
  updated_at?: string;
  product?: Product;
  store?: Store;
}

export interface Comparison {
  id: string;
  user_id: string;
  name: string;
  total_spent: number;
  created_at: string;
  updated_at?: string;
  comparison_items?: ComparisonItem[];
}

export interface ComparisonItem {
  id: string;
  comparison_id: string;
  product_id: string;
  store_id: string;
  quantity: number;
  price: number;
  created_at?: string;
  product?: Product;
  store?: Store;
}

export interface MonthlyReport {
  id: string;
  user_id: string;
  month: number;
  year: number;
  total_spent: number;
  total_savings: number;
  comparison_count: number;
  created_at: string;
  comparisons?: Comparison[];
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
  userId: string;
  timestamp: Date;
  verified: boolean;
}

export interface ContributionStatus {
  id: string;
  user_id: string;
  product_name: string;
  store_name: string;
  price: number;
  city: string;
  state: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
  reviewer_id?: string;
  reviewed_at?: string;
  notes?: string;
}

export interface PlanLimits {
  comparisons: number;
  reports: number;
  features: string[];
}

export type PlanTier = 'free' | 'premium' | 'pro';
