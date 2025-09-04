import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[OFFERS-NOTIFIER] Function started');

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get VAPID configuration
    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
    const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? "mailto:mariovendasonline10K@gmail.com";

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.error('[OFFERS-NOTIFIER] Missing VAPID keys');
      return new Response(JSON.stringify({ error: 'VAPID keys not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Configure web-push with VAPID details
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('[OFFERS-NOTIFIER] Invalid JSON body:', error);
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { offerId, city, state, productName, storeName, price } = requestBody;

    // Validate required fields
    if (!offerId || !city || !state || !productName || !storeName || price === undefined) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: offerId, city, state, productName, storeName, price' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('[OFFERS-NOTIFIER] Processing offer:', { offerId, city, state, productName, storeName });

    // Input sanitization
    const sanitizedCity = String(city).trim().substring(0, 100);
    const sanitizedState = String(state).trim().substring(0, 50);
    const sanitizedProductName = String(productName).trim().substring(0, 200);
    const sanitizedStoreName = String(storeName).trim().substring(0, 100);
    const numericPrice = parseFloat(String(price));

    if (isNaN(numericPrice) || numericPrice <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid price value' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Get users who should receive notifications for this location
    const { data: eligibleUsers, error: usersError } = await supabase
      .from('push_subscriptions')
      .select(`
        user_id,
        endpoint,
        p256dh,
        auth,
        marketing_enabled,
        location_city,
        location_state
      `)
      .eq('location_city', sanitizedCity)
      .eq('location_state', sanitizedState)
      .eq('marketing_enabled', true);

    if (usersError) {
      console.error('[OFFERS-NOTIFIER] Error fetching users:', usersError);
      return new Response(JSON.stringify({ error: usersError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log(`[OFFERS-NOTIFIER] Found ${eligibleUsers?.length || 0} eligible users`);

    if (!eligibleUsers || eligibleUsers.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No eligible users found for this location',
        processed: 0 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const notifications = [];
    const failedNotifications = [];

    // Process each user with proper rate limiting and permissions
    for (const user of eligibleUsers) {
      try {
        // Check if user can receive notification
        const { data: canSend, error: checkError } = await supabase
          .rpc('can_send_notification', {
            target_user_id: user.user_id,
            notification_type: 'marketing_offer',
            channel_type: 'push'
          });

        if (checkError || !canSend) {
          console.log(`[OFFERS-NOTIFIER] User ${user.user_id} cannot receive notification:`, checkError);
          continue;
        }

        // Prepare push notification subscription
        const subscription: WebPushSubscription = {
          endpoint: user.endpoint,
          keys: {
            p256dh: user.p256dh,
            auth: user.auth
          }
        };

        // Prepare notification payload
        const payload = {
          title: '🏷️ Nova Oferta Especial!',
          body: `${sanitizedProductName} por R$ ${numericPrice.toFixed(2)} na ${sanitizedStoreName}`,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          data: {
            type: 'marketing_offer',
            offerId: String(offerId),
            city: sanitizedCity,
            state: sanitizedState,
            url: '/'
          },
          actions: [
            {
              action: 'view',
              title: 'Ver Ofertas'
            },
            {
              action: 'close',
              title: 'Fechar'
            }
          ]
        };

        // Send push notification using web-push library (NOT FCM directly)
        await webpush.sendNotification(subscription, JSON.stringify(payload));

        notifications.push({
          user_id: user.user_id,
          success: true
        });

        // Record successful notification
        await supabase.rpc('record_notification_sent', {
          target_user_id: user.user_id,
          notification_type: 'marketing_offer',
          channel_type: 'push',
          success_status: true,
          notification_metadata: {
            offerId: String(offerId),
            city: sanitizedCity,
            state: sanitizedState,
            productName: sanitizedProductName,
            storeName: sanitizedStoreName,
            price: numericPrice
          }
        });

        // Insert in-app notification
        await supabase
          .from('notifications')
          .insert({
            user_id: user.user_id,
            type: 'marketing_offer',
            title: 'Nova Oferta Especial!',
            message: `${sanitizedProductName} por R$ ${numericPrice.toFixed(2)} na ${sanitizedStoreName} - ${sanitizedCity}/${sanitizedState}`,
            data: {
              offerId: String(offerId),
              city: sanitizedCity,
              state: sanitizedState,
              productName: sanitizedProductName,
              storeName: sanitizedStoreName,
              price: numericPrice
            }
          });

        console.log(`[OFFERS-NOTIFIER] Notification sent successfully to user ${user.user_id}`);

      } catch (error) {
        console.error(`[OFFERS-NOTIFIER] Failed to send notification to user ${user.user_id}:`, error);
        failedNotifications.push({
          user_id: user.user_id,
          error: error instanceof Error ? error.message : String(error)
        });

        // Record failed notification
        await supabase.rpc('record_notification_sent', {
          target_user_id: user.user_id,
          notification_type: 'marketing_offer',
          channel_type: 'push',
          success_status: false,
          notification_metadata: {
            error: error instanceof Error ? error.message : String(error),
            offerId: String(offerId),
            city: sanitizedCity,
            state: sanitizedState
          }
        });
      }
    }

    // Log security event
    await supabase.rpc('log_security_event', {
      event_type: 'marketing_notifications_sent',
      severity: 'info',
      details: {
        offerId: String(offerId),
        city: sanitizedCity,
        state: sanitizedState,
        total_eligible: eligibleUsers.length,
        successful_sends: notifications.length,
        failed_sends: failedNotifications.length
      }
    });

    console.log(`[OFFERS-NOTIFIER] Processed ${notifications.length} successful notifications, ${failedNotifications.length} failed`);

    return new Response(JSON.stringify({
      success: true,
      processed: eligibleUsers.length,
      successful: notifications.length,
      failed: failedNotifications.length,
      details: {
        successful: notifications,
        failed: failedNotifications
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('[OFFERS-NOTIFIER] Function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      stack: error.stack 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);