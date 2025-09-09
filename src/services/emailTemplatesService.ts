import { supabase } from "@/integrations/supabase/client";

export interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateEmailTemplateData {
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables?: string[];
}

export class EmailTemplatesService {
  async getTemplates(): Promise<EmailTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching email templates:', error);
        throw error;
      }

      return data?.map(template => ({
        ...template,
        variables: Array.isArray(template.variables) 
          ? (template.variables as any[]).map(v => String(v))
          : typeof template.variables === 'string' 
            ? JSON.parse(template.variables) 
            : []
      })) || [];
    } catch (error) {
      console.error('EmailTemplatesService.getTemplates error:', error);
      throw error;
    }
  }

  async getTemplateById(id: string): Promise<EmailTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching email template:', error);
        throw error;
      }

      return data ? {
        ...data,
        variables: Array.isArray(data.variables) 
          ? (data.variables as any[]).map(v => String(v))
          : typeof data.variables === 'string' 
            ? JSON.parse(data.variables) 
            : []
      } : null;
    } catch (error) {
      console.error('EmailTemplatesService.getTemplateById error:', error);
      throw error;
    }
  }

  async createTemplate(templateData: CreateEmailTemplateData): Promise<EmailTemplate> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: templateData.name,
          subject: templateData.subject,
          html_content: templateData.html_content,
          text_content: templateData.text_content,
          variables: templateData.variables || []
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating email template:', error);
        throw error;
      }

      return {
        ...data,
        variables: Array.isArray(data.variables) ? (data.variables as any[]).map(v => String(v)) : []
      };
    } catch (error) {
      console.error('EmailTemplatesService.createTemplate error:', error);
      throw error;
    }
  }

  async updateTemplate(id: string, templateData: Partial<CreateEmailTemplateData>): Promise<EmailTemplate> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update({
          name: templateData.name,
          subject: templateData.subject,
          html_content: templateData.html_content,
          text_content: templateData.text_content,
          variables: templateData.variables || []
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating email template:', error);
        throw error;
      }

      return {
        ...data,
        variables: Array.isArray(data.variables) ? (data.variables as any[]).map(v => String(v)) : []
      };
    } catch (error) {
      console.error('EmailTemplatesService.updateTemplate error:', error);
      throw error;
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting email template:', error);
        throw error;
      }
    } catch (error) {
      console.error('EmailTemplatesService.deleteTemplate error:', error);
      throw error;
    }
  }
}

export const emailTemplatesService = new EmailTemplatesService();