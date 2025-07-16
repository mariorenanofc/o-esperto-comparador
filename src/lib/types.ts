import { z } from 'zod'; // Importar Zod

export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
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

// Additional types needed for the application
export interface ComparisonData {
  products: Product[];
  stores: Store[];
  date?: Date;
  userId?: string;
}

export interface ProductFormData {
  name: string;
  quantity: number;
  unit: string;
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
  status: 'new' | 'reviewed' | 'resolved';
  created_at: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  createdAt?: string;
}

// Schema Zod para PriceContribution
export const PriceContributionSchema = z.object({
  productName: z.string().trim().min(1, "Nome do produto é obrigatório."),
  price: z.number().min(0.01, "Preço deve ser maior que zero.").max(999999, "Preço muito alto."),
  storeName: z.string().trim().min(1, "Nome da loja é obrigatório."),
  city: z.string().trim().min(1, "Cidade é obrigatória."),
  state: z.string().trim().length(2, "Estado deve ter 2 caracteres.").toUpperCase(), // Ex: PE, SP
  userId: z.string().uuid("ID de usuário inválido."), // Assumindo que userId é um UUID
  timestamp: z.instanceof(Date, { message: "Timestamp inválido." }),
  verified: z.boolean(),
  quantity: z.number().min(1, "Quantidade deve ser pelo menos 1.").optional().default(1),
  unit: z.string().trim().min(1, "Unidade é obrigatória.").optional().default('unidade'),
});

// Para inferir o tipo do Zod Schema, útil para tipagem de formulários
export type PriceContributionFormData = z.infer<typeof PriceContributionSchema>;
