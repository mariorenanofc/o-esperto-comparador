export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      analytics_alerts: {
        Row: {
          alert_type: string
          comparison_operator: string
          created_at: string
          id: string
          is_active: boolean
          last_triggered: string | null
          metric_name: string
          notification_channels: Json | null
          threshold_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          comparison_operator?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered?: string | null
          metric_name: string
          notification_channels?: Json | null
          threshold_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          comparison_operator?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered?: string | null
          metric_name?: string
          notification_channels?: Json | null
          threshold_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          event_type: string
          id: string
          ip_address: unknown | null
          page_url: string | null
          properties: Json | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          properties?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          properties?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: Json
          rate_limit_per_hour: number
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: Json
          rate_limit_per_hour?: number
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json
          rate_limit_per_hour?: number
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      api_performance_logs: {
        Row: {
          created_at: string
          endpoint: string
          error_message: string | null
          id: string
          method: string
          request_size_bytes: number | null
          response_size_bytes: number | null
          response_time_ms: number
          status_code: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          error_message?: string | null
          id?: string
          method: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms: number
          status_code: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          error_message?: string | null
          id?: string
          method?: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number
          status_code?: number
          user_id?: string | null
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          api_key_id: string
          created_at: string
          endpoint: string
          id: string
          requests_count: number
          window_start: string
        }
        Insert: {
          api_key_id: string
          created_at?: string
          endpoint: string
          id?: string
          requests_count?: number
          window_start?: string
        }
        Update: {
          api_key_id?: string
          created_at?: string
          endpoint?: string
          id?: string
          requests_count?: number
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_rate_limits_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      email_templates: {
        Row: {
          created_at: string
          created_by: string | null
          html_content: string
          id: string
          name: string
          subject: string
          text_content: string | null
          updated_at: string
          variables: Json | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          html_content: string
          id?: string
          name: string
          subject: string
          text_content?: string | null
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          html_content?: string
          id?: string
          name?: string
          subject?: string
          text_content?: string | null
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
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
      notification_send_log: {
        Row: {
          channel: string
          created_at: string
          id: string
          metadata: Json | null
          notification_type: string
          sent_at: string
          success: boolean | null
          user_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          notification_type: string
          sent_at?: string
          success?: boolean | null
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          notification_type?: string
          sent_at?: string
          success?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          admin_notifications_enabled: boolean | null
          contributions_enabled: boolean | null
          created_at: string
          desktop_enabled: boolean | null
          email_enabled: boolean | null
          id: string
          location_city: string | null
          location_state: string | null
          marketing_enabled: boolean | null
          offers_enabled: boolean | null
          push_enabled: boolean | null
          quiet_hours_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sound_enabled: boolean | null
          subscription_reminders_enabled: boolean | null
          suggestions_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notifications_enabled?: boolean | null
          contributions_enabled?: boolean | null
          created_at?: string
          desktop_enabled?: boolean | null
          email_enabled?: boolean | null
          id?: string
          location_city?: string | null
          location_state?: string | null
          marketing_enabled?: boolean | null
          offers_enabled?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sound_enabled?: boolean | null
          subscription_reminders_enabled?: boolean | null
          suggestions_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notifications_enabled?: boolean | null
          contributions_enabled?: boolean | null
          created_at?: string
          desktop_enabled?: boolean | null
          email_enabled?: boolean | null
          id?: string
          location_city?: string | null
          location_state?: string | null
          marketing_enabled?: boolean | null
          offers_enabled?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sound_enabled?: boolean | null
          subscription_reminders_enabled?: boolean | null
          suggestions_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          clicked: boolean | null
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clicked?: boolean | null
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clicked?: boolean | null
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          category: string
          created_at: string | null
          id: string
          name: string
          quantity: number
          unit: string
        }
        Insert: {
          category?: string
          created_at?: string | null
          id?: string
          name: string
          quantity?: number
          unit?: string
        }
        Update: {
          category?: string
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
          location_city: string | null
          location_state: string | null
          marketing_enabled: boolean | null
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
          location_city?: string | null
          location_state?: string | null
          marketing_enabled?: boolean | null
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
          location_city?: string | null
          location_state?: string | null
          marketing_enabled?: boolean | null
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          attempts: number | null
          blocked_until: string | null
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown | null
          updated_at: string | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: unknown | null
          updated_at?: string | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown | null
          updated_at?: string | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      security_reminders: {
        Row: {
          created_at: string | null
          description: string
          id: string
          status: string | null
          task_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          status?: string | null
          task_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          status?: string | null
          task_type?: string
          updated_at?: string | null
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
      subscription_history: {
        Row: {
          amount_paid: number
          created_at: string
          currency: string | null
          id: string
          metadata: Json | null
          payment_status: string
          period_end: string | null
          period_start: string | null
          plan_type: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid: number
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_status: string
          period_end?: string | null
          period_start?: string | null
          plan_type: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_status?: string
          period_end?: string | null
          period_start?: string | null
          plan_type?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
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
      user_access_control: {
        Row: {
          access_suspended: boolean | null
          created_at: string
          current_plan: string | null
          grace_period_days: number | null
          id: string
          last_payment_date: string | null
          months_subscribed: number | null
          next_billing_date: string | null
          plan_end_date: string | null
          plan_start_date: string | null
          subscription_count: number | null
          suspension_reason: string | null
          total_invested: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_suspended?: boolean | null
          created_at?: string
          current_plan?: string | null
          grace_period_days?: number | null
          id?: string
          last_payment_date?: string | null
          months_subscribed?: number | null
          next_billing_date?: string | null
          plan_end_date?: string | null
          plan_start_date?: string | null
          subscription_count?: number | null
          suspension_reason?: string | null
          total_invested?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_suspended?: boolean | null
          created_at?: string
          current_plan?: string | null
          grace_period_days?: number | null
          id?: string
          last_payment_date?: string | null
          months_subscribed?: number | null
          next_billing_date?: string | null
          plan_end_date?: string | null
          plan_start_date?: string | null
          subscription_count?: number | null
          suspension_reason?: string | null
          total_invested?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_dashboard_widgets: {
        Row: {
          created_at: string
          enabled: boolean
          height: number
          id: string
          position_x: number
          position_y: number
          updated_at: string
          user_id: string
          widget_config: Json
          widget_type: string
          width: number
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          height?: number
          id?: string
          position_x?: number
          position_y?: number
          updated_at?: string
          user_id: string
          widget_config?: Json
          widget_type: string
          width?: number
        }
        Update: {
          created_at?: string
          enabled?: boolean
          height?: number
          id?: string
          position_x?: number
          position_y?: number
          updated_at?: string
          user_id?: string
          widget_config?: Json
          widget_type?: string
          width?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      advanced_security_audit: {
        Args: {
          additional_details?: Json
          event_type: string
          severity?: string
          system_context?: Json
          user_context?: Json
        }
        Returns: undefined
      }
      can_send_notification: {
        Args: {
          channel_type?: string
          notification_type: string
          target_user_id: string
        }
        Returns: boolean
      }
      check_admin_with_auth: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_api_rate_limit: {
        Args: {
          api_key_input: string
          endpoint_name: string
          max_requests_per_hour?: number
        }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          block_minutes?: number
          endpoint_name: string
          max_attempts?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      check_user_admin_status: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      check_user_feature_access: {
        Args: { current_usage?: number; feature_name: string }
        Returns: boolean
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_daily_offers: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_orphaned_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      detect_security_anomalies: {
        Args: { check_type?: string }
        Returns: Json
      }
      enhanced_mask_sensitive_data: {
        Args: { data_input: Json; mask_level?: string }
        Returns: Json
      }
      enhanced_sanitize_text_input: {
        Args: { input_text: string }
        Returns: string
      }
      generate_api_key: {
        Args: { expires_in_days?: number; key_name: string }
        Returns: Json
      }
      get_db_usage: {
        Args: { limit_bytes?: number }
        Returns: Json
      }
      get_masked_profile_data: {
        Args: { target_user_id: string }
        Returns: Json
      }
      get_offers_by_location: {
        Args: { city_param?: string; hours_back?: number; state_param?: string }
        Returns: {
          city: string
          contributor_name: string
          created_at: string
          id: string
          price: number
          product_name: string
          quantity: number
          state: string
          store_name: string
          unit: string
        }[]
      }
      get_user_subscription_stats: {
        Args: { target_user_id: string }
        Returns: Json
      }
      is_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          action_details?: Json
          action_type: string
          target_user?: string
        }
        Returns: undefined
      }
      log_critical_security_event: {
        Args: { details?: Json; event_type: string; severity?: string }
        Returns: undefined
      }
      log_critical_security_event_enhanced: {
        Args: {
          auto_block?: boolean
          details?: Json
          event_type: string
          severity?: string
          threat_level?: string
        }
        Returns: undefined
      }
      log_security_event: {
        Args: { details?: Json; event_type: string; severity?: string }
        Returns: undefined
      }
      mark_inactive_users_offline: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      mask_sensitive_admin_data: {
        Args: { email_input: string }
        Returns: string
      }
      record_notification_sent: {
        Args: {
          channel_type?: string
          notification_metadata?: Json
          notification_type: string
          success_status?: boolean
          target_user_id: string
        }
        Returns: undefined
      }
      sanitize_text_input: {
        Args: { input_text: string }
        Returns: string
      }
      search_products_optimized: {
        Args: {
          category_filter?: string
          limit_count?: number
          search_term?: string
        }
        Returns: {
          category: string
          created_at: string
          id: string
          name: string
          quantity: number
          similarity_score: number
          unit: string
        }[]
      }
      user_plan_access: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      validate_api_key: {
        Args: { api_key_input: string }
        Returns: Json
      }
      validate_email: {
        Args: { email_input: string }
        Returns: boolean
      }
      validate_price: {
        Args: { price_input: number }
        Returns: boolean
      }
      verify_admin_with_enhanced_logging: {
        Args: {
          log_attempt?: boolean
          operation_type?: string
          required_permissions?: string[]
        }
        Returns: Json
      }
      verify_admin_with_logging: {
        Args: { operation_type?: string }
        Returns: boolean
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
