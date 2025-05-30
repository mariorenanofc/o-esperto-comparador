
// Tipos baseados no schema do Prisma
export interface DatabaseUser {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseStore {
  id: string;
  name: string;
}

export interface DatabaseProduct {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface DatabaseComparison {
  id: string;
  userId: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseProductPrice {
  id: string;
  productId: string;
  storeId: string;
  price: number;
}

export interface DatabaseMonthlyReport {
  id: string;
  userId: string;
  month: string;
  year: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabasePriceContribution {
  id: string;
  userId: string;
  productId: string;
  storeId: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseSuggestion {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'improvement' | 'feature' | 'bug' | 'other';
  status: 'open' | 'in-review' | 'implemented' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para dados completos com relacionamentos
export interface ComparisonWithDetails {
  id: string;
  userId: string;
  date: Date;
  stores: DatabaseStore[];
  products: (DatabaseProduct & {
    prices: { [storeId: string]: number };
  })[];
}

export interface PriceContributionWithDetails {
  id: string;
  userId: string;
  price: number;
  status: string;
  createdAt: Date;
  user: DatabaseUser;
  product: DatabaseProduct;
  store: DatabaseStore;
}

export interface SuggestionWithUser {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: Date;
  user: DatabaseUser;
}
