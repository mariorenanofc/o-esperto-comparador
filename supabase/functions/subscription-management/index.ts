import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SUBSCRIPTION-MANAGEMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_KEY_SECRET");
    if (!stripeKey) throw new Error("STRIPE_KEY_SECRET is not set");

    // Use service role for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { userId } = await req.json();
    if (!userId) throw new Error("User ID is required");

    logStep("Processing subscription management for user", { targetUserId: userId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Buscar customer do Stripe
    const customers = await stripe.customers.list({ 
      limit: 100
    });
    
    // Buscar dados do usuário no Supabase
    const { data: targetUser } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!targetUser) {
      throw new Error("User not found");
    }

    // Encontrar customer pelo email
    const customer = customers.data.find(c => c.email === targetUser.email);
    let subscriptionHistory = [];
    let accessControl = {};

    if (customer) {
      logStep("Found Stripe customer", { customerId: customer.id });

      // Buscar todas as subscriptions (ativas e canceladas)
      const allSubscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 100,
        status: "all"
      });

      // Buscar invoices para histórico de pagamentos
      const invoices = await stripe.invoices.list({
        customer: customer.id,
        limit: 100,
        status: "paid"
      });

      // Processar histórico de pagamentos
      for (const invoice of invoices.data) {
        if (invoice.subscription && invoice.status === "paid") {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription.toString());
          const priceId = subscription.items.data[0].price.id;
          
          let planType = "premium";
          let amount = invoice.amount_paid;

          if (priceId === "price_1RuDphJxMPLn2TAn2SrsAoyv") {
            planType = "pro";
          }

          // Inserir/atualizar histórico de pagamento
          await supabaseClient
            .from("subscription_history")
            .upsert({
              user_id: userId,
              stripe_subscription_id: subscription.id,
              stripe_payment_intent_id: invoice.payment_intent?.toString(),
              plan_type: planType,
              amount_paid: amount,
              currency: invoice.currency || 'usd',
              payment_status: 'paid',
              period_start: new Date(invoice.period_start * 1000).toISOString(),
              period_end: new Date(invoice.period_end * 1000).toISOString(),
              created_at: new Date(invoice.created * 1000).toISOString(),
              metadata: {
                invoice_id: invoice.id,
                subscription_status: subscription.status
              }
            }, { 
              onConflict: 'stripe_subscription_id,period_start' 
            });

          subscriptionHistory.push({
            id: invoice.id,
            amount: amount / 100,
            currency: invoice.currency,
            date: new Date(invoice.created * 1000),
            plan: planType,
            status: subscription.status
          });
        }
      }

      // Calcular estatísticas
      const totalInvested = subscriptionHistory.reduce((sum, payment) => sum + payment.amount, 0);
      const monthsSubscribed = subscriptionHistory.length;
      const firstPayment = subscriptionHistory.length > 0 ? 
        new Date(Math.min(...subscriptionHistory.map(p => p.date.getTime()))) : null;
      const lastPayment = subscriptionHistory.length > 0 ? 
        new Date(Math.max(...subscriptionHistory.map(p => p.date.getTime()))) : null;

      // Buscar subscription ativa
      const activeSubscription = allSubscriptions.data.find(sub => sub.status === "active");
      let planEndDate = null;
      let nextBillingDate = null;

      if (activeSubscription) {
        planEndDate = new Date(activeSubscription.current_period_end * 1000);
        nextBillingDate = new Date(activeSubscription.current_period_end * 1000);
      }

      // Atualizar controle de acesso
      await supabaseClient
        .from("user_access_control")
        .upsert({
          user_id: userId,
          current_plan: targetUser.plan || 'free',
          plan_start_date: firstPayment?.toISOString(),
          plan_end_date: planEndDate?.toISOString(),
          total_invested: totalInvested,
          months_subscribed: monthsSubscribed,
          subscription_count: monthsSubscribed,
          last_payment_date: lastPayment?.toISOString(),
          next_billing_date: nextBillingDate?.toISOString(),
          access_suspended: false
        }, { 
          onConflict: 'user_id' 
        });

      accessControl = {
        totalInvested,
        monthsSubscribed,
        firstPaymentDate: firstPayment,
        lastPaymentDate: lastPayment,
        planEndDate,
        nextBillingDate,
        accessSuspended: false
      };
    } else {
      logStep("No Stripe customer found for user");
      
      // Criar controle de acesso para usuário sem Stripe
      await supabaseClient
        .from("user_access_control")
        .upsert({
          user_id: userId,
          current_plan: targetUser.plan || 'free',
          total_invested: 0,
          months_subscribed: 0,
          subscription_count: 0,
          access_suspended: false
        }, { 
          onConflict: 'user_id' 
        });

      accessControl = {
        totalInvested: 0,
        monthsSubscribed: 0,
        firstPaymentDate: null,
        lastPaymentDate: null,
        planEndDate: null,
        nextBillingDate: null,
        accessSuspended: false
      };
    }

    logStep("Subscription management completed successfully");

    return new Response(JSON.stringify({
      success: true,
      subscriptionHistory: subscriptionHistory.sort((a, b) => b.date.getTime() - a.date.getTime()),
      accessControl,
      stripeCustomerId: customer?.id || null
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in subscription-management", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});