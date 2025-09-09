import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string | string[];
  template_id?: string;
  subject?: string;
  html_content?: string;
  text_content?: string;
  variables?: Record<string, string>;
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
    const { data: isAdmin, error: adminError } = await supabase.rpc('check_admin_with_auth');
    if (adminError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailRequest: EmailRequest = await req.json();
    
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

      // Replace variables in content
      if (emailRequest.variables) {
        const templateVariables = template.variables || [];
        console.log('Template variables:', templateVariables);
        console.log('Provided variables:', emailRequest.variables);

        for (const [key, value] of Object.entries(emailRequest.variables)) {
          const placeholder = `{{${key}}}`;
          subject = subject.replace(new RegExp(placeholder, 'g'), value);
          htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
          textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
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

    // For now, we'll simulate email sending
    // In a real implementation, you would integrate with an email service like Resend
    console.log('Email would be sent:', {
      to: emailRequest.to,
      subject,
      htmlContent: htmlContent.substring(0, 100) + '...',
      textContent: textContent.substring(0, 100) + '...'
    });

    // Simulate successful email sending
    const recipients = Array.isArray(emailRequest.to) ? emailRequest.to : [emailRequest.to];
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email would be sent to ${recipients.length} recipient(s)`,
        recipients: recipients.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

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