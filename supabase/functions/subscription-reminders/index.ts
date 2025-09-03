import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[SUBSCRIPTION-REMINDERS] Function started');

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
      console.error('[SUBSCRIPTION-REMINDERS] Missing VAPID keys');
      return new Response(JSON.stringify({ error: 'VAPID keys not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Find subscribers whose subscription ends in 3 days or 1 day
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    console.log('[SUBSCRIPTION-REMINDERS] Checking for subscriptions expiring on:', 
      { threeDays: threeDaysFromNow, oneDay: oneDayFromNow });

    // Get users with subscriptions expiring soon
    const { data: expiringSubscriptions, error: subscriptionsError } = await supabase
      .from('subscribers')
      .select(`
        user_id,
        email,
        subscription_tier,
        subscription_end,
        subscribed
      `)
      .eq('subscribed', true)
      .in('subscription_end::date', [
        threeDaysFromNow.toISOString().split('T')[0],
        oneDayFromNow.toISOString().split('T')[0]
      ]);

    if (subscriptionsError) {
      console.error('[SUBSCRIPTION-REMINDERS] Error fetching expiring subscriptions:', subscriptionsError);
      return new Response(JSON.stringify({ error: subscriptionsError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log(`[SUBSCRIPTION-REMINDERS] Found ${expiringSubscriptions?.length || 0} expiring subscriptions`);

    if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No expiring subscriptions found',
        processed: 0 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const notifications = [];
    const failedNotifications = [];

    // Process each expiring subscription
    for (const subscription of expiringSubscriptions) {
      try {
        const expirationDate = new Date(subscription.subscription_end);
        const daysUntilExpiry = Math.ceil((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        // Check if user can receive notification
        const { data: canSend, error: checkError } = await supabase
          .rpc('can_send_notification', {
            target_user_id: subscription.user_id,
            notification_type: 'subscription_reminder',
            channel_type: 'push'
          });

        if (checkError || !canSend) {
          console.log(`[SUBSCRIPTION-REMINDERS] User ${subscription.user_id} cannot receive notification:`, checkError);
          continue;
        }

        // Check if we already sent a reminder for this period
        const { data: existingReminder, error: reminderError } = await supabase
          .from('notification_send_log')
          .select('id')
          .eq('user_id', subscription.user_id)
          .eq('notification_type', 'subscription_reminder')
          .gte('sent_at', new Date().toISOString().split('T')[0])
          .limit(1)
          .single();

        if (!reminderError && existingReminder) {
          console.log(`[SUBSCRIPTION-REMINDERS] Reminder already sent today for user ${subscription.user_id}`);
          continue;
        }

        // Get user's push subscriptions
        const { data: pushSubs, error: pushError } = await supabase
          .from('push_subscriptions')
          .select('endpoint, p256dh, auth')
          .eq('user_id', subscription.user_id);

        if (pushError || !pushSubs || pushSubs.length === 0) {
          console.log(`[SUBSCRIPTION-REMINDERS] No push subscriptions found for user ${subscription.user_id}`);
          continue;
        }

        // Prepare notification content
        let title, message;
        if (daysUntilExpiry <= 1) {
          title = '⚠️ Assinatura expira em 1 dia!';
          message = 'Sua assinatura Premium expira amanhã. Renove agora para não perder acesso!';
        } else {
          title = '🔔 Lembrete de Renovação';
          message = `Sua assinatura ${subscription.subscription_tier} expira em ${daysUntilExpiry} dias. Renove para continuar aproveitando!`;
        }

        // Send push notification to all user devices
        let successCount = 0;
        for (const pushSub of pushSubs) {
          try {
            const payload = {
              title,
              body: message,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              data: {
                type: 'subscription_reminder',
                userId: subscription.user_id,
                daysUntilExpiry,
                url: '/plans'
              },
              actions: [
                {
                  action: 'renew',
                  title: 'Renovar Agora'
                },
                {
                  action: 'close',
                  title: 'Fechar'
                }
              ],
              requireInteraction: true // Make it persistent for important subscription reminders
            };

            const response = await fetch('https://fcm.googleapis.com/fcm/send', {
              method: 'POST',
              headers: {
                'Authorization': `key=${vapidPrivateKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: pushSub.endpoint.split('/').pop(),
                notification: payload,
                webpush: {
                  headers: {
                    'Urgency': 'high'
                  }
                }
              })
            });

            if (response.ok) {
              successCount++;
            }
          } catch (pushError) {
            console.error(`[SUBSCRIPTION-REMINDERS] Push notification failed for user ${subscription.user_id}:`, pushError);
          }
        }

        if (successCount > 0) {
          // Record notification sent
          await supabase.rpc('record_notification_sent', {
            target_user_id: subscription.user_id,
            notification_type: 'subscription_reminder',
            channel_type: 'push',
            success_status: true,
            notification_metadata: {
              subscription_tier: subscription.subscription_tier,
              expiration_date: subscription.subscription_end,
              days_until_expiry: daysUntilExpiry,
              devices_notified: successCount
            }
          });

          // Insert in-app notification
          await supabase
            .from('notifications')
            .insert({
              user_id: subscription.user_id,
              type: 'subscription_reminder',
              title,
              message,
              data: {
                subscription_tier: subscription.subscription_tier,
                expiration_date: subscription.subscription_end,
                days_until_expiry: daysUntilExpiry
              }
            });

          notifications.push({
            user_id: subscription.user_id,
            success: true,
            devices_notified: successCount
          });

          console.log(`[SUBSCRIPTION-REMINDERS] Reminder sent successfully to user ${subscription.user_id} on ${successCount} devices`);
        } else {
          failedNotifications.push({
            user_id: subscription.user_id,
            error: 'No push notifications were delivered successfully'
          });
        }

      } catch (error) {
        console.error(`[SUBSCRIPTION-REMINDERS] Failed to send reminder to user ${subscription.user_id}:`, error);
        failedNotifications.push({
          user_id: subscription.user_id,
          error: error.message
        });

        // Record failed notification
        await supabase.rpc('record_notification_sent', {
          target_user_id: subscription.user_id,
          notification_type: 'subscription_reminder',
          channel_type: 'push',
          success_status: false,
          notification_metadata: {
            error: error.message
          }
        });
      }
    }

    console.log(`[SUBSCRIPTION-REMINDERS] Processed ${notifications.length} successful reminders, ${failedNotifications.length} failed`);

    return new Response(JSON.stringify({
      success: true,
      processed: expiringSubscriptions.length,
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
    console.error('[SUBSCRIPTION-REMINDERS] Function error:', error);
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