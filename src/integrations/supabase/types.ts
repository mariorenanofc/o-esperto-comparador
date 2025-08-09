export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      comparison_exports: {
        Row: {
          comparison_id: string | null
          created_at: string
          exported_at: string
          file_size_bytes: number | null
          format: string
          id: string
          meta: Json | null
          plan: string | null
          user_id: string
        }
        Insert: {
          comparison_id?: string | null
          created_at?: string
          exported_at?: string
          file_size_bytes?: number | null
          format?: string
          id?: string
          meta?: Json | null
          plan?: string | null
          user_id: string
        }
        Update: {
          comparison_id?: string | null
          created_at?: string
          exported_at?: string
          file_size_bytes?: number | null
          format?: string
          id?: string
          meta?: Json | null
          plan?: string | null
          user_id?: string
        }
        Relationships: []
      }
      comparison_products: {
        Row: {
          comparison_id: string
          created_at: string | null
          id: string
          product_id: string
        }
        Insert: {
          comparison_id: string
          created_at?: string | null
          id?: string
          product_id: string
        }
        Update: {
          comparison_id?: string
          created_at?: string | null
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comparison_products_comparison_id_fkey"
            columns: ["comparison_id"]
            isOneToOne: false
            referencedRelation: "comparisons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comparison_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      comparisons: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comparisons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_offers: {
        Row: {
          city: string
          contributor_name: string
          created_at: string | null
          id: string
          price: number
          product_name: string
          quantity: number | null
          state: string
          store_name: string
          unit: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          city: string
          contributor_name: string
          created_at?: string | null
          id?: string
          price: number
          product_name: string
          quantity?: number | null
          state: string
          store_name: string
          unit?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          city?: string
          contributor_name?: string
          created_at?: string | null
          id?: string
          price?: number
          product_name?: string
          quantity?: number | null
          state?: string
          store_name?: string
          unit?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_offers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_reports: {
        Row: {
          created_at: string | null
          id: string
          month: string
          total_spent: number
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          month: string
          total_spent?: number
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: string
          total_spent?: number
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_prices: {
        Row: {
          comparison_id: string | null
          created_at: string | null
          id: string
          price: number
          product_id: string
          store_id: string
        }
        Insert: {
          comparison_id?: string | null
          created_at?: string | null
          id?: string
          price: number
          product_id: string
          store_id: string
        }
        Update: {
          comparison_id?: string | null
          created_at?: string | null
          id?: string
          price?: number
          product_id?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_prices_comparison_id_fkey"
            columns: ["comparison_id"]
            isOneToOne: false
            referencedRelation: "comparisons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_prices_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          id: string
          name: string
          quantity: number
          unit: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          quantity?: number
          unit?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          quantity?: number
          unit?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          comparisons_made_this_month: number | null
          created_at: string | null
          email: string
          id: string
          is_online: boolean | null
          last_activity: string | null
          last_comparison_reset_month: number | null
          name: string | null
          plan: string | null
          updated_at: string | null
        }
        Insert: {
          comparisons_made_this_month?: number | null
          created_at?: string | null
          email: string
          id: string
          is_online?: boolean | null
          last_activity?: string | null
          last_comparison_reset_month?: number | null
          name?: string | null
          plan?: string | null
          updated_at?: string | null
        }
        Update: {
          comparisons_made_this_month?: number | null
          created_at?: string | null
          email?: string
          id?: string
          is_online?: boolean | null
          last_activity?: string | null
          last_comparison_reset_month?: number | null
          name?: string | null
          plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stores: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_admin_status: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      check_user_feature_access: {
        Args: { feature_name: string; current_usage?: number }
        Returns: boolean
      }
      is_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mark_inactive_users_offline: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_plan_access: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
