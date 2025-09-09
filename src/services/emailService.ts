import { supabase } from "@/integrations/supabase/client";

export interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables?: string[];
}

export interface EmailData {
  to: string | string[];
  template_id?: string;
  subject?: string;
  html_content?: string;
  text_content?: string;
  variables?: Record<string, string>;
}

export class EmailService {
  async sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData
      });

      if (error) {
        console.error('Email sending error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: 'Failed to send email' };
    }
  }

  async getTemplates(): Promise<EmailTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching email templates:', error);
        return [];
      }

      return data?.map(template => ({
        ...template,
        variables: Array.isArray(template.variables) 
          ? template.variables as string[]
          : typeof template.variables === 'string' 
            ? JSON.parse(template.variables) 
            : []
      })) || [];
    } catch (error) {
      console.error('Email service error:', error);
      return [];
    }
  }

  async saveTemplate(template: EmailTemplate): Promise<{ success: boolean; error?: string }> {
    try {
      const templateData = {
        name: template.name,
        subject: template.subject,
        html_content: template.html_content,
        text_content: template.text_content,
        variables: template.variables || []
      };

      let query;
      if (template.id) {
        query = supabase
          .from('email_templates')
          .update(templateData)
          .eq('id', template.id);
      } else {
        query = supabase
          .from('email_templates')
          .insert(templateData);
      }

      const { error } = await query;

      if (error) {
        console.error('Error saving email template:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: 'Failed to save template' };
    }
  }

  async deleteTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error('Error deleting email template:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: 'Failed to delete template' };
    }
  }
}

export const emailService = new EmailService();