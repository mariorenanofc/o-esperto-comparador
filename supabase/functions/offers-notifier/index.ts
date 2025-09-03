import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

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

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get VAPID keys
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidSubject = Deno.env.get('VAPID_SUBJECT');

    if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
      console.error('[OFFERS-NOTIFIER] Missing VAPID keys');
      return new Response(JSON.stringify({ error: 'VAPID keys not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Parse request body to get offer details
    const { offerId, city, state, productName, storeName, price } = await req.json();
    console.log('[OFFERS-NOTIFIER] Processing offer:', { offerId, city, state, productName, storeName });

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
      .eq('location_city', city)
      .eq('location_state', state)
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

    // Process each user
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

        // Prepare push notification
        const subscription: WebPushSubscription = {
          endpoint: user.endpoint,
          keys: {
            p256dh: user.p256dh,
            auth: user.auth
          }
        };

        const payload = {
          title: '🏷️ Nova Oferta Especial!',
          body: `${productName} por R$ ${price.toFixed(2)} na ${storeName}`,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          data: {
            type: 'marketing_offer',
            offerId,
            city,
            state,
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

        // Send push notification using Web Push Protocol
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${vapidPrivateKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: subscription.endpoint.split('/').pop(),
            notification: payload,
            webpush: {
              headers: {
                'Urgency': 'normal'
              }
            }
          })
        });

        if (response.ok) {
          notifications.push({
            user_id: user.user_id,
            success: true
          });

          // Record notification sent
          await supabase.rpc('record_notification_sent', {
            target_user_id: user.user_id,
            notification_type: 'marketing_offer',
            channel_type: 'push',
            success_status: true,
            notification_metadata: {
              offerId,
              city,
              state,
              productName,
              storeName,
              price
            }
          });

          // Insert in-app notification
          await supabase
            .from('notifications')
            .insert({
              user_id: user.user_id,
              type: 'marketing_offer',
              title: 'Nova Oferta Especial!',
              message: `${productName} por R$ ${price.toFixed(2)} na ${storeName} - ${city}/${state}`,
              data: {
                offerId,
                city,
                state,
                productName,
                storeName,
                price
              }
            });

          console.log(`[OFFERS-NOTIFIER] Notification sent successfully to user ${user.user_id}`);
        } else {
          throw new Error(`Push notification failed: ${response.status}`);
        }

      } catch (error) {
        console.error(`[OFFERS-NOTIFIER] Failed to send notification to user ${user.user_id}:`, error);
        failedNotifications.push({
          user_id: user.user_id,
          error: error.message
        });

        // Record failed notification
        await supabase.rpc('record_notification_sent', {
          target_user_id: user.user_id,
          notification_type: 'marketing_offer',
          channel_type: 'push',
          success_status: false,
          notification_metadata: {
            error: error.message,
            offerId,
            city,
            state
          }
        });
      }
    }

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
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);