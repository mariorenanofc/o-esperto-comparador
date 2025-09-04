import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10'
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting helper
async function checkRateLimit(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data: allowed } = await supabase.rpc('check_rate_limit', {
      endpoint_name: 'notify_admins',
      max_attempts: 5, // More restrictive for admin notifications
      window_minutes: 60,
      block_minutes: 60
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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    // Use service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authorization: Check if user has permission to notify admins
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    // Only allow premium/pro/admin users to notify admins
    const allowedPlans = ['premium', 'pro', 'admin'];
    if (!userProfile || !allowedPlans.includes(userProfile.plan)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient privileges. Only premium+ users can send admin notifications.' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Rate limiting check
    if (!(await checkRateLimit(supabaseAdmin, user.id))) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse body
    let payload: { 
      title?: string; 
      body?: string; 
      url?: string; 
      data?: Record<string, unknown>; 
      type?: string;
      category?: string; // For categorizing admin notifications
    } = {};
    
    try {
      payload = await req.json();
    } catch (_) {
      // Use defaults if parsing fails
    }

    // Sanitize inputs
    const title = sanitizeInput(payload.title || "Nova notificação");
    const body = sanitizeInput(payload.body || "Você tem uma nova atualização");
    const url = sanitizeInput(payload.url || "/");
    const category = sanitizeInput(payload.category || "general");

    // Validate notification category
    const allowedCategories = ['urgent', 'general', 'feedback', 'suggestion', 'contribution', 'system'];
    const notificationCategory = allowedCategories.includes(category) ? category : 'general';

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

    // Find admins
    const { data: admins, error: adminsError } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("plan", "admin");

    if (adminsError) {
      return new Response(JSON.stringify({ error: adminsError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const adminIds = (admins || []).map((a: { id: string }) => a.id);
    if (adminIds.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No admin subscribers" }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get push subscriptions for admins
    const { data: subs, error: subsError } = await supabaseAdmin
      .from("push_subscriptions")
      .select("user_id, endpoint, p256dh, auth")
      .in("user_id", adminIds);

    if (subsError) {
      return new Response(JSON.stringify({ error: subsError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check notification permissions for each admin
    const eligibleSubs = [];
    for (const sub of subs || []) {
      const { data: canSend } = await supabaseAdmin
        .rpc('can_send_notification', {
          target_user_id: sub.user_id,
          notification_type: 'admin_notification',
          channel_type: 'push'
        });
      
      if (canSend) {
        eligibleSubs.push(sub);
      }
    }

    if (eligibleSubs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No eligible admin subscribers" }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const notifications = eligibleSubs.map((s: { user_id: string; endpoint: string; p256dh: string; auth: string }) => {
      const subscription = {
        endpoint: s.endpoint,
        keys: { p256dh: s.p256dh, auth: s.auth },
      } as any;

      const payloadJson = JSON.stringify({ 
        title: `[${notificationCategory.toUpperCase()}] ${title}`, 
        body, 
        url, 
        data: {
          ...payload.data,
          category: notificationCategory,
          sender_id: user.id,
          sender_email: user.email
        }, 
        type: 'admin_notification',
        ts: Date.now() 
      });
      
      return webpush
        .sendNotification(subscription, payloadJson)
        .then(() => ({ ok: true, user_id: s.user_id }))
        .catch((err) => ({ ok: false, error: String(err), user_id: s.user_id }));
    });

    const results = await Promise.allSettled(notifications);
    const successful = results.filter((r) => r.status === "fulfilled" && (r as PromiseFulfilledResult<any>).value.ok);
    const sent = successful.length;

    // Record notification sending for each admin
    for (const result of successful) {
      const userId = (result as PromiseFulfilledResult<any>).value.user_id;
      await supabaseAdmin.rpc('record_notification_sent', {
        target_user_id: userId,
        notification_type: 'admin_notification',
        channel_type: 'push',
        success_status: true,
        notification_metadata: {
          title,
          body,
          url,
          category: notificationCategory,
          sender_id: user.id,
          sender_email: user.email
        }
      });

      // Create in-app notification for admin
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'admin_notification',
          title: `[${notificationCategory.toUpperCase()}] ${title}`,
          message: body,
          data: {
            category: notificationCategory,
            sender_id: user.id,
            sender_email: user.email,
            url
          }
        });
    }

    // Log security event
    await supabaseAdmin.rpc('log_security_event', {
      event_type: 'admin_notification_sent',
      severity: notificationCategory === 'urgent' ? 'warning' : 'info',
      details: {
        sender_id: user.id,
        sender_email: user.email,
        sender_plan: userProfile.plan,
        category: notificationCategory,
        successful_sends: sent,
        total_admins: adminIds.length,
        total_subscriptions: eligibleSubs.length
      }
    });

    return new Response(JSON.stringify({ 
      sent, 
      total_admins: adminIds.length, 
      total_subscriptions: eligibleSubs.length,
      category: notificationCategory 
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error('Error in notify-admins:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});