import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10'
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Parse body
    let payload: { 
      title?: string; 
      body?: string; 
      url?: string; 
      data?: Record<string, unknown>; 
      type?: string 
    } = {};
    
    try {
      payload = await req.json();
    } catch (_) {
      // Use defaults if parsing fails
    }

    const title = payload.title || "Nova notificação";
    const body = payload.body || "Você tem uma nova atualização";
    const url = payload.url || "/";

    // Configure web-push
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
    const SUBJECT = "mailto:mariovendasonline10K@gmail.com";

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return new Response(JSON.stringify({ error: "Missing VAPID keys" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    webpush.setVapidDetails(SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    // Use service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find admins
    const { data: admins, error: adminsError } = await supabaseAdmin
      .from("profiles")
      .select("id")
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
      .select("endpoint, p256dh, auth")
      .in("user_id", adminIds);

    if (subsError) {
      return new Response(JSON.stringify({ error: subsError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const notifications = (subs || []).map((s: { endpoint: string; p256dh: string; auth: string }) => {
      const subscription = {
        endpoint: s.endpoint,
        keys: { p256dh: s.p256dh, auth: s.auth },
      } as any;

      const payloadJson = JSON.stringify({ title, body, url, data: payload.data, ts: Date.now() });
      return webpush
        .sendNotification(subscription, payloadJson)
        .then(() => ({ ok: true }))
        .catch((err) => ({ ok: false, error: String(err) }));
    });

    const results = await Promise.allSettled(notifications);
    const sent = results.filter((r) => r.status === "fulfilled" && (r as PromiseFulfilledResult<any>).value.ok).length;

    return new Response(JSON.stringify({ sent }), {
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