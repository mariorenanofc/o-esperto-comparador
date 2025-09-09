import { supabase } from "@/integrations/supabase/client";

export interface DashboardWidget {
  id?: string;
  user_id?: string;
  widget_type: 'bar' | 'line' | 'pie' | 'metric';
  widget_config: {
    title: string;
    dataSource: string;
    xAxis?: string;
    yAxis?: string;
    color?: string;
    size?: 'small' | 'medium' | 'large';
  };
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateWidgetData {
  widget_type: DashboardWidget['widget_type'];
  widget_config: DashboardWidget['widget_config'];
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  enabled: boolean;
}

export class UserDashboardService {
  async getUserWidgets(userId: string): Promise<DashboardWidget[]> {
    try {
      const { data, error } = await supabase
        .from('user_dashboard_widgets')
        .select('*')
        .eq('user_id', userId)
        .order('position_y', { ascending: true })
        .order('position_x', { ascending: true });

      if (error) {
        console.error('Error fetching user widgets:', error);
        throw error;
      }

      return data?.map(widget => ({
        ...widget,
        widget_type: widget.widget_type as 'bar' | 'line' | 'pie' | 'metric',
        widget_config: widget.widget_config as DashboardWidget['widget_config']
      })) || [];
    } catch (error) {
      console.error('UserDashboardService.getUserWidgets error:', error);
      throw error;
    }
  }

  async createWidget(userId: string, widgetData: CreateWidgetData): Promise<DashboardWidget> {
    try {
      const { data, error } = await supabase
        .from('user_dashboard_widgets')
        .insert({
          user_id: userId,
          widget_type: widgetData.widget_type,
          widget_config: widgetData.widget_config,
          position_x: widgetData.position_x,
          position_y: widgetData.position_y,
          width: widgetData.width,
          height: widgetData.height,
          enabled: widgetData.enabled
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating widget:', error);
        throw error;
      }

      return {
        ...data,
        widget_type: data.widget_type as 'bar' | 'line' | 'pie' | 'metric',
        widget_config: data.widget_config as DashboardWidget['widget_config']
      };
    } catch (error) {
      console.error('UserDashboardService.createWidget error:', error);
      throw error;
    }
  }

  async updateWidget(widgetId: string, widgetData: Partial<CreateWidgetData>): Promise<DashboardWidget> {
    try {
      const { data, error } = await supabase
        .from('user_dashboard_widgets')
        .update(widgetData)
        .eq('id', widgetId)
        .select()
        .single();

      if (error) {
        console.error('Error updating widget:', error);
        throw error;
      }

      return {
        ...data,
        widget_type: data.widget_type as 'bar' | 'line' | 'pie' | 'metric',
        widget_config: data.widget_config as DashboardWidget['widget_config']
      };
    } catch (error) {
      console.error('UserDashboardService.updateWidget error:', error);
      throw error;
    }
  }

  async deleteWidget(widgetId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_dashboard_widgets')
        .delete()
        .eq('id', widgetId);

      if (error) {
        console.error('Error deleting widget:', error);
        throw error;
      }
    } catch (error) {
      console.error('UserDashboardService.deleteWidget error:', error);
      throw error;
    }
  }

  async saveUserDashboard(userId: string, widgets: DashboardWidget[]): Promise<void> {
    try {
      // Delete existing widgets for the user
      await supabase
        .from('user_dashboard_widgets')
        .delete()
        .eq('user_id', userId);

      // Insert new widgets
      if (widgets.length > 0) {
        const widgetsToInsert = widgets.map(widget => ({
          user_id: userId,
          widget_type: widget.widget_type,
          widget_config: widget.widget_config,
          position_x: widget.position_x,
          position_y: widget.position_y,
          width: widget.width,
          height: widget.height,
          enabled: widget.enabled
        }));

        const { error } = await supabase
          .from('user_dashboard_widgets')
          .insert(widgetsToInsert);

        if (error) {
          console.error('Error saving dashboard widgets:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('UserDashboardService.saveUserDashboard error:', error);
      throw error;
    }
  }
}

export const userDashboardService = new UserDashboardService();