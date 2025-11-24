import { supabase } from "@/integrations/supabase/client";
import { errorHandler } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

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
    return errorHandler.handleAsync(
      async () => {
        logger.info('Sending email', { to: emailData.to, subject: emailData.subject });
        
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: emailData
        });

        if (error) throw error;

        logger.info('Email sent successfully');
        return { success: true };
      },
      { component: 'EmailService', action: 'enviar email' },
      { severity: 'high', showToast: true }
    ) || { success: false, error: 'Failed to send email' };
  }

  async getTemplates(): Promise<EmailTemplate[]> {
    return errorHandler.handleAsync(
      async () => {
        logger.info('Fetching email templates');
        
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const templates = data?.map(template => ({
          ...template,
          variables: Array.isArray(template.variables) 
            ? template.variables as string[]
            : typeof template.variables === 'string' 
              ? JSON.parse(template.variables) 
              : []
        })) || [];
        
        logger.info('Email templates fetched', { count: templates.length });
        return templates;
      },
      { component: 'EmailService', action: 'buscar templates' },
      { severity: 'medium', showToast: false }
    ) || [];
  }

  async saveTemplate(template: EmailTemplate): Promise<{ success: boolean; error?: string }> {
    return errorHandler.handleAsync(
      async () => {
        logger.info('Saving email template', { name: template.name, hasId: !!template.id });
        
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
        if (error) throw error;

        logger.info('Email template saved successfully', { templateId: template.id });
        return { success: true };
      },
      { component: 'EmailService', action: 'salvar template' },
      { severity: 'high', showToast: true }
    ) || { success: false, error: 'Failed to save template' };
  }

  async deleteTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
    return errorHandler.handleAsync(
      async () => {
        logger.info('Deleting email template', { templateId });
        
        const { error } = await supabase
          .from('email_templates')
          .delete()
          .eq('id', templateId);

        if (error) throw error;

        logger.info('Email template deleted successfully', { templateId });
        return { success: true };
      },
      { component: 'EmailService', action: 'deletar template', metadata: { templateId } },
      { severity: 'high', showToast: true }
    ) || { success: false, error: 'Failed to delete template' };
  }
}

export const emailService = new EmailService();