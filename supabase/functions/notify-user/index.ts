import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10'
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting helper
async function checkRateLimit(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data: allowed } = await supabase.rpc('check_rate_limit', {
      endpoint_name: 'notify_user',
      max_attempts: 10,
      window_minutes: 60,
      block_minutes: 30
    });
    return !!allowed;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true; // Allow on error to prevent blocking legitimate users
  }
}

// Input sanitization
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .substring(0, 500) // Limit length
    .replace(/[<>\"'&;]/g, '') // Remove potential XSS characters
    .replace(/(union|select|insert|update|delete|drop|create|alter)\s/gi, ''); // Basic SQL injection protection
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Rate limiting check
    if (!(await checkRateLimit(supabase, user.id))) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse and validate body
    let payload: { 
      userId: string;
      title?: string; 
      body?: string; 
      url?: string; 
      data?: Record<string, unknown>; 
      type?: string;
    } = {};
    
    try {
      payload = await req.json();
    } catch (_) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!payload.userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Use service role for admin operations to check permissions
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authorization: Only allow users to send notifications to themselves OR admins to send to anyone
    const { data: isAdmin } = await supabaseAdmin.rpc('check_admin_with_auth');
    
    if (!isAdmin && payload.userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Insufficient privileges. You can only send notifications to yourself.' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sanitize inputs
    const title = sanitizeInput(payload.title || "Nova notificação");
    const body = sanitizeInput(payload.body || "Você tem uma nova atualização");
    const url = sanitizeInput(payload.url || "/");

    // Validate notification type
    const allowedTypes = ['system', 'marketing_offer', 'price_alert', 'suggestion', 'admin'];
    const notificationType = payload.type && allowedTypes.includes(payload.type) ? payload.type : 'system';

    // Configure web-push
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
    const SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:mariovendasonline10K@gmail.com";

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return new Response(JSON.stringify({ error: "Missing VAPID keys" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    webpush.setVapidDetails(SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    // Check if target user can receive notifications
    const { data: canSend, error: canSendError } = await supabaseAdmin
      .rpc('can_send_notification', {
        target_user_id: payload.userId,
        notification_type: notificationType,
        channel_type: 'push'
      });

    if (canSendError || !canSend) {
      return new Response(JSON.stringify({ 
        error: 'User cannot receive notifications at this time',
        details: canSendError?.message 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get push subscriptions for the specific user
    const { data: subs, error: subsError } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", payload.userId);

    if (subsError) {
      return new Response(JSON.stringify({ error: subsError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No subscriptions found for user" }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const notifications = subs.map((s: { endpoint: string; p256dh: string; auth: string }) => {
      const subscription = {
        endpoint: s.endpoint,
        keys: { p256dh: s.p256dh, auth: s.auth },
      } as any;

      const payloadJson = JSON.stringify({ 
        title, 
        body, 
        url, 
        data: payload.data, 
        type: notificationType,
        ts: Date.now() 
      });
      
      return webpush
        .sendNotification(subscription, payloadJson)
        .then(() => ({ ok: true }))
        .catch((err) => ({ ok: false, error: String(err) }));
    });

    const results = await Promise.allSettled(notifications);
    const sent = results.filter((r) => r.status === "fulfilled" && (r as PromiseFulfilledResult<any>).value.ok).length;

    // Record notification sending
    await supabaseAdmin.rpc('record_notification_sent', {
      target_user_id: payload.userId,
      notification_type: notificationType,
      channel_type: 'push',
      success_status: sent > 0,
      notification_metadata: {
        title,
        body,
        url,
        sender_id: user.id,
        total_subscriptions: subs.length,
        successful_sends: sent
      }
    });

    // Log security event
    await supabaseAdmin.rpc('log_security_event', {
      event_type: 'notification_sent',
      severity: 'info',
      details: {
        sender_id: user.id,
        target_user_id: payload.userId,
        notification_type: notificationType,
        successful_sends: sent,
        total_subscriptions: subs.length
      }
    });

    return new Response(JSON.stringify({ sent, total_subscriptions: subs.length }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error('Error in notify-user:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});