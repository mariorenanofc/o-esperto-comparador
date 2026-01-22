import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-MP-CHECKOUT] ${step}${detailsStr}`);
};

// Mapeamento de planos para preços
const planPrices: Record<string, { name: string; price: number }> = {
  premium: { name: "Premium", price: 14.99 },
  pro: { name: "Pro", price: 29.90 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN is not set");
    }
    logStep("Mercado Pago access token verified");

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id });

    // Get plan from request body
    const { planId } = await req.json();
    if (!planId || !planPrices[planId]) {
      throw new Error(`Invalid plan: ${planId}`);
    }
    
    const plan = planPrices[planId];
    logStep("Plan selected", { planId, planName: plan.name, price: plan.price });

    const origin = req.headers.get("origin") || "https://o-esperto-comparador.lovable.app";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";

    // Create Mercado Pago preference
    const preference = {
      items: [
        {
          id: planId,
          title: `Plano ${plan.name} - O Esperto Comparador`,
          description: `Assinatura mensal do plano ${plan.name}`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: plan.price,
        },
      ],
      payer: {
        email: user.email,
      },
      back_urls: {
        success: `${origin}/success?provider=mercadopago`,
        failure: `${origin}/plans?error=payment_failed`,
        pending: `${origin}/plans?status=pending`,
      },
      auto_return: "approved",
      external_reference: `${user.id}:${planId}`,
      notification_url: `${supabaseUrl}/functions/v1/mp-webhook`,
      statement_descriptor: "ESPERTO COMPARADOR",
      expires: false,
    };

    logStep("Creating Mercado Pago preference", { external_reference: preference.external_reference });

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    if (!response.ok) {
      const errorData = await response.text();
      logStep("Mercado Pago API error", { status: response.status, error: errorData });
      throw new Error(`Mercado Pago API error: ${response.status}`);
    }

    const preferenceData = await response.json();
    logStep("Preference created successfully", { 
      preferenceId: preferenceData.id, 
      initPoint: preferenceData.init_point 
    });

    return new Response(
      JSON.stringify({ 
        url: preferenceData.init_point,
        preferenceId: preferenceData.id 
      }),
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
