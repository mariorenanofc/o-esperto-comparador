import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsAlert {
  id?: string;
  user_id?: string;
  alert_type: string;
  metric_name: string;
  comparison_operator: 'greater_than' | 'less_than' | 'equals';
  threshold_value: number;
  is_active: boolean;
  notification_channels: ('email' | 'push' | 'in_app')[];
  last_triggered?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAlertData {
  alert_type: string;
  metric_name: string;
  comparison_operator: AnalyticsAlert['comparison_operator'];
  threshold_value: number;
  is_active: boolean;
  notification_channels: AnalyticsAlert['notification_channels'];
}

export class AlertsService {
  async getUserAlerts(userId: string): Promise<AnalyticsAlert[]> {
    try {
      const { data, error } = await supabase
        .from('analytics_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user alerts:', error);
        throw error;
      }

      return data?.map(alert => ({
        ...alert,
        notification_channels: Array.isArray(alert.notification_channels) 
          ? alert.notification_channels as ('email' | 'push' | 'in_app')[]
          : [],
        comparison_operator: alert.comparison_operator as 'greater_than' | 'less_than' | 'equals'
      })) || [];
    } catch (error) {
      console.error('AlertsService.getUserAlerts error:', error);
      throw error;
    }
  }

  async createAlert(userId: string, alertData: CreateAlertData): Promise<AnalyticsAlert> {
    try {
      const { data, error } = await supabase
        .from('analytics_alerts')
        .insert({
          user_id: userId,
          alert_type: alertData.alert_type,
          metric_name: alertData.metric_name,
          comparison_operator: alertData.comparison_operator,
          threshold_value: alertData.threshold_value,
          is_active: alertData.is_active,
          notification_channels: alertData.notification_channels
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating alert:', error);
        throw error;
      }

      return {
        ...data,
        notification_channels: Array.isArray(data.notification_channels) 
          ? data.notification_channels as ('email' | 'push' | 'in_app')[]
          : [],
        comparison_operator: data.comparison_operator as 'greater_than' | 'less_than' | 'equals'
      };
    } catch (error) {
      console.error('AlertsService.createAlert error:', error);
      throw error;
    }
  }

  async updateAlert(alertId: string, alertData: Partial<CreateAlertData>): Promise<AnalyticsAlert> {
    try {
      const { data, error } = await supabase
        .from('analytics_alerts')
        .update(alertData)
        .eq('id', alertId)
        .select()
        .single();

      if (error) {
        console.error('Error updating alert:', error);
        throw error;
      }

      return {
        ...data,
        notification_channels: Array.isArray(data.notification_channels) 
          ? data.notification_channels as ('email' | 'push' | 'in_app')[]
          : [],
        comparison_operator: data.comparison_operator as 'greater_than' | 'less_than' | 'equals'
      };
    } catch (error) {
      console.error('AlertsService.updateAlert error:', error);
      throw error;
    }
  }

  async deleteAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('analytics_alerts')
        .delete()
        .eq('id', alertId);

      if (error) {
        console.error('Error deleting alert:', error);
        throw error;
      }
    } catch (error) {
      console.error('AlertsService.deleteAlert error:', error);
      throw error;
    }
  }

  async toggleAlert(alertId: string, isActive: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('analytics_alerts')
        .update({ is_active: isActive })
        .eq('id', alertId);

      if (error) {
        console.error('Error toggling alert:', error);
        throw error;
      }
    } catch (error) {
      console.error('AlertsService.toggleAlert error:', error);
      throw error;
    }
  }

  async getAlertById(alertId: string): Promise<AnalyticsAlert | null> {
    try {
      const { data, error } = await supabase
        .from('analytics_alerts')
        .select('*')
        .eq('id', alertId)
        .single();

      if (error) {
        console.error('Error fetching alert:', error);
        throw error;
      }

      return data ? {
        ...data,
        notification_channels: Array.isArray(data.notification_channels) 
          ? data.notification_channels as ('email' | 'push' | 'in_app')[]
          : [],
        comparison_operator: data.comparison_operator as 'greater_than' | 'less_than' | 'equals'
      } : null;
    } catch (error) {
      console.error('AlertsService.getAlertById error:', error);
      throw error;
    }
  }
}

export const alertsService = new AlertsService();