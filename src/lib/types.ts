export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  prices: { [storeId: string]: number };
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
  products?: Product[];
  stores?: Store[];
  date?: Date;
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
  quantity?: number;
  unit?: string;
}

export interface ContributionStatus {
  id: string;
  user_id: string;
  product_name: string;
  store_name: string;
  price: number;
  city: string;
  state: string;
  status: "pending" | "approved" | "rejected";
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

export type PlanTier = "free" | "premium" | "pro";

// Additional types needed for the application
export interface ComparisonData {
  products: Product[];
  stores: Store[];
  date?: Date;
  userId?: string;
  location?: string; // Cidade/UF ou descrição livre do local da comparação
}

export interface ProductFormData {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  prices: { [storeId: string]: number };
}

export interface PriceValidationResult {
  isValid: boolean;
  message?: string;
  conflictingPrice?: number;
  conflictingContributor?: string;
  priceDifference?: number;
}

export interface UserProfile {
  id: string;
  name?: string;
  email: string;
  plan?: PlanTier;
  created_at?: string;
}

export interface UserFeedback {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "open" | "in-review" | "implemented" | "closed";
  created_at: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  createdAt?: string;
}

// Nova interface para categorias de produtos
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface para filtros e busca
export interface ProductFilters {
  category?: string;
  search?: string;
  sortBy?: 'name' | 'category' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}
