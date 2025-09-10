import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  template_id?: string;
  subject?: string;
  html_content?: string;
  text_content?: string;
  variables?: Record<string, string>;
  tags?: { name: string; value: string }[];
  reply_to?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: isAdmin, error: adminError } = await supabase.rpc('check_user_admin_status', { user_uuid: user.id });
    
    const emailRequest: EmailRequest = await req.json();
    
    // Validate recipients based on user role
    const recipients = Array.isArray(emailRequest.to) ? emailRequest.to : [emailRequest.to];
    const ccRecipients = emailRequest.cc ? (Array.isArray(emailRequest.cc) ? emailRequest.cc : [emailRequest.cc]) : [];
    const bccRecipients = emailRequest.bcc ? (Array.isArray(emailRequest.bcc) ? emailRequest.bcc : [emailRequest.bcc]) : [];
    
    if (!isAdmin) {
      // Non-admin users can only send emails to themselves
      const allRecipients = [...recipients, ...ccRecipients, ...bccRecipients];
      if (allRecipients.length !== 1 || allRecipients[0] !== user.email) {
        return new Response(
          JSON.stringify({ error: 'Non-admin users can only send test emails to their own address' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    if (adminError && !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize template variables to prevent XSS
    const sanitizeVariable = (value: string): string => {
      return value
        .replace(/[<>\"'&]/g, (match) => {
          const entityMap: Record<string, string> = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '&': '&amp;'
          };
          return entityMap[match] || match;
        })
        .substring(0, 500); // Limit variable length
    };
    
    let subject = emailRequest.subject || '';
    let htmlContent = emailRequest.html_content || '';
    let textContent = emailRequest.text_content || '';

    // If template_id is provided, fetch the template
    if (emailRequest.template_id) {
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', emailRequest.template_id)
        .single();

      if (templateError || !template) {
        return new Response(
          JSON.stringify({ error: 'Template not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      subject = template.subject;
      htmlContent = template.html_content;
      textContent = template.text_content || '';

      // Replace variables in content with sanitization
      if (emailRequest.variables) {
        const templateVariables = template.variables || [];
        console.log('Template variables:', templateVariables);
        console.log('Provided variables:', emailRequest.variables);

        for (const [key, value] of Object.entries(emailRequest.variables)) {
          const sanitizedValue = sanitizeVariable(value);
          const placeholder = `{{${key}}}`;
          subject = subject.replace(new RegExp(placeholder, 'g'), sanitizedValue);
          htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), sanitizedValue);
          textContent = textContent.replace(new RegExp(placeholder, 'g'), sanitizedValue);
        }

        // Check for unreplaced variables and log warnings
        const unreplacedVars = templateVariables.filter(variable => 
          !emailRequest.variables!.hasOwnProperty(variable)
        );
        
        if (unreplacedVars.length > 0) {
          console.warn(`Missing variables in email request: ${unreplacedVars.join(', ')}`);
          console.warn('These variables will appear as placeholders in the email');
        }
      }
    }

    // Initialize Resend client
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get email configuration from environment or use defaults
    const fromEmail = Deno.env.get('EMAIL_FROM') || 'Economia Comparada <onboarding@resend.dev>';
    const replyTo = Deno.env.get('EMAIL_REPLY_TO');
    
    const resend = new Resend(resendApiKey);
    
    // Send emails
    const results = [];
    const errors = [];
    
    try {
      for (const recipient of recipients) {
        try {
          // Build email payload with enhanced options
          const emailPayload: any = {
            from: fromEmail,
            to: [recipient],
            subject,
            html: htmlContent,
          };

          // Add optional fields
          if (textContent) emailPayload.text = textContent;
          if (ccRecipients.length > 0) emailPayload.cc = ccRecipients;
          if (bccRecipients.length > 0) emailPayload.bcc = bccRecipients;
          if (emailRequest.reply_to || replyTo) emailPayload.reply_to = emailRequest.reply_to || replyTo;
          if (emailRequest.tags && emailRequest.tags.length > 0) emailPayload.tags = emailRequest.tags;

          const emailResponse = await resend.emails.send(emailPayload);
          
          if (emailResponse.error) {
            console.error(`Resend API error for ${recipient}:`, {
              name: emailResponse.error.name,
              message: emailResponse.error.message,
              details: emailResponse.error
            });
            errors.push({ 
              recipient, 
              error: `Resend API error: ${emailResponse.error.message}`,
              code: emailResponse.error.name
            });
          } else {
            results.push({ recipient, success: true, id: emailResponse.data?.id });
            console.log(`Email sent successfully to ${recipient}:`, {
              id: emailResponse.data?.id,
              from: fromEmail,
              subject: subject
            });
          }
        } catch (emailError: any) {
          console.error(`Failed to send email to ${recipient}:`, {
            message: emailError.message,
            stack: emailError.stack,
            name: emailError.name
          });
          errors.push({ 
            recipient, 
            error: emailError.message,
            code: emailError.name || 'UNKNOWN_ERROR'
          });
        }
      }
      
      // Log notification for successful sends
      if (results.length > 0) {
        try {
          await supabase.rpc('record_notification_sent', {
            target_user_id: user.id,
            notification_type: emailRequest.template_id ? 'template_email' : 'custom_email',
            channel_type: 'email',
            success_status: true,
            notification_metadata: {
              template_id: emailRequest.template_id,
              recipients_count: results.length,
              success_count: results.length,
              errors_count: errors.length
            }
          });
        } catch (logError) {
          console.warn('Failed to log notification:', logError);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: `Email sent successfully to ${results.length} recipient(s)`,
          results,
          errors: errors.length > 0 ? errors : undefined
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
      
    } catch (error: any) {
      console.error('Email sending failed:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email',
          details: error.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Error in send-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);