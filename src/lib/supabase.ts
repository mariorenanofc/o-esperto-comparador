import { createClient } from "@supabase/supabase-js";

// Para desenvolvimento local, usando valores placeholder
// No ambiente de produção, essas variáveis devem ser configuradas adequadamente
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

//export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          plan: "free" | "premium" | "pro" | "empresarial";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          plan?: "free" | "premium" | "pro" | "empresarial";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          plan?: "free" | "premium" | "pro" | "empresarial";
          created_at?: string;
          updated_at?: string;
        };
      };
      stores: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          quantity: number;
          unit: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          quantity: number;
          unit: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          quantity?: number;
          unit?: string;
          created_at?: string;
        };
      };
      comparisons: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      comparison_products: {
        Row: {
          id: string;
          comparison_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          comparison_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          comparison_id?: string;
          product_id?: string;
          created_at?: string;
        };
      };
      product_prices: {
        Row: {
          id: string;
          product_id: string;
          store_id: string;
          price: number;
          comparison_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          store_id: string;
          price: number;
          comparison_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          store_id?: string;
          price?: number;
          comparison_id?: string | null;
          created_at?: string;
        };
      };
      daily_offers: {
        Row: {
          id: string;
          user_id: string;
          product_name: string;
          price: number;
          store_name: string;
          city: string;
          state: string;
          contributor_name: string;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_name: string;
          price: number;
          store_name: string;
          city: string;
          state: string;
          contributor_name: string;
          verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_name?: string;
          price?: number;
          store_name?: string;
          city?: string;
          state?: string;
          contributor_name?: string;
          verified?: boolean;
          created_at?: string;
        };
      };
      monthly_reports: {
        Row: {
          id: string;
          user_id: string;
          month: string;
          year: number;
          total_spent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          month: string;
          year: number;
          total_spent: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          month?: string;
          year?: number;
          total_spent?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      suggestions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: "improvement" | "feature" | "bug" | "other";
          status: "open" | "in-review" | "implemented" | "closed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          category: "improvement" | "feature" | "bug" | "other";
          status?: "open" | "in-review" | "implemented" | "closed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          category?: "improvement" | "feature" | "bug" | "other";
          status?: "open" | "in-review" | "implemented" | "closed";
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
