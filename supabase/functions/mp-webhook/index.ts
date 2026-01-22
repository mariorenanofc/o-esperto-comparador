import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MP-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN is not set");
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Parse webhook notification
    const body = await req.json();
    logStep("Webhook body", body);

    const { type, data } = body;

    // Only process payment notifications
    if (type !== "payment") {
      logStep("Ignoring non-payment notification", { type });
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      throw new Error("Payment ID not found in webhook");
    }

    logStep("Fetching payment details", { paymentId });

    // Fetch payment details from Mercado Pago
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    if (!paymentResponse.ok) {
      throw new Error(`Failed to fetch payment: ${paymentResponse.status}`);
    }

    const payment = await paymentResponse.json();
    logStep("Payment details", { 
      status: payment.status, 
      external_reference: payment.external_reference 
    });

    // Only process approved payments
    if (payment.status !== "approved") {
      logStep("Payment not approved, skipping", { status: payment.status });
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Parse external_reference (format: userId:planId)
    const externalReference = payment.external_reference;
    if (!externalReference || !externalReference.includes(":")) {
      throw new Error(`Invalid external_reference: ${externalReference}`);
    }

    const [userId, planId] = externalReference.split(":");
    logStep("Processing approved payment", { userId, planId });

    // Update user's plan in profiles table
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ 
        plan: planId,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (updateError) {
      logStep("Error updating profile", { error: updateError.message });
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    // Check if subscribers table exists and update
    const { error: subscriberError } = await supabaseAdmin
      .from("subscribers")
      .upsert({
        user_id: userId,
        email: payment.payer?.email || "",
        mercadopago_customer_id: payment.payer?.id?.toString() || null,
        payment_provider: "mercadopago",
        subscription_tier: planId,
        subscription_status: "active",
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id"
      });

    if (subscriberError) {
      logStep("Error updating subscribers (may not exist)", { error: subscriberError.message });
      // Don't throw - the profiles update is what matters
    }

    logStep("Payment processed successfully", { userId, planId });

    return new Response(
      JSON.stringify({ success: true, userId, planId }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
