import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface Database {
  public: {
    Tables: {
      comparisons: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title?: string;
          date?: string;
        };
        Update: {
          title?: string;
          date?: string;
        };
      };
      comparison_products: {
        Row: {
          id: string;
          comparison_id: string;
          product_id: string;
          created_at: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          category: string;
          unit: string;
          quantity: number;
        };
      };
    };
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient<Database>(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  try {
    // Validate API key
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required', code: 'UNAUTHORIZED' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: keyValidation, error: keyError } = await supabaseClient.rpc(
      'check_api_rate_limit',
      { api_key_input: apiKey, endpoint_name: 'comparisons', max_requests_per_hour: 1000 }
    );

    if (keyError || !keyValidation) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key or rate limit exceeded', code: 'RATE_LIMITED' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const method = req.method;

    // GET - List daily offers with filters
    if (method === 'GET') {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
      const search = url.searchParams.get('search') || '';
      const city = url.searchParams.get('city') || '';
      const state = url.searchParams.get('state') || '';
      const verified = url.searchParams.get('verified');
      const hoursBack = parseInt(url.searchParams.get('hours') || '24');
      const offset = (page - 1) * limit;

      // Calculate timestamp for filtering
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hoursBack);

      let query = supabaseClient
        .from('daily_offers')
        .select('*', { count: 'exact' })
        .gte('created_at', cutoffTime.toISOString())
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('product_name', `%${search}%`);
      }
      if (city) {
        query = query.ilike('city', `%${city}%`);
      }
      if (state) {
        query = query.eq('state', state.toUpperCase());
      }
      if (verified !== null && verified !== undefined) {
        query = query.eq('verified', verified === 'true');
      }

      const { data: offers, error, count } = await query;

      if (error) throw error;

      // Calculate meta statistics
      const uniqueStores = new Set(offers?.map(o => o.store_name) || []);
      const avgPrice = offers && offers.length > 0 
        ? offers.reduce((sum, o) => sum + o.price, 0) / offers.length 
        : 0;

      const totalPages = Math.ceil((count || 0) / limit);

      return new Response(
        JSON.stringify({
          data: offers?.map(offer => ({
            id: offer.id,
            product_name: offer.product_name,
            price: offer.price,
            quantity: offer.quantity,
            unit: offer.unit,
            store_name: offer.store_name,
            city: offer.city,
            state: offer.state,
            contributor_name: offer.contributor_name,
            verified: offer.verified,
            created_at: offer.created_at
          })),
          pagination: {
            page,
            limit,
            total: count,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
          meta: {
            hours_back: hoursBack,
            total_stores: uniqueStores.size,
            avg_price: Math.round(avgPrice * 100) / 100
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST - Get price comparison for multiple products
    if (method === 'POST') {
      const body = await req.json();
      const { products, city, state } = body;

      if (!products || !Array.isArray(products) || products.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Products array is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get offers for requested products
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - 48);

      let query = supabaseClient
        .from('daily_offers')
        .select('*')
        .gte('created_at', cutoffTime.toISOString())
        .order('price', { ascending: true });

      if (city) query = query.ilike('city', `%${city}%`);
      if (state) query = query.eq('state', state.toUpperCase());

      // Build OR filter for products
      const productFilters = products.map((p: string) => `product_name.ilike.%${p}%`).join(',');
      query = query.or(productFilters);

      const { data: offers, error } = await query;

      if (error) throw error;

      // Group by product and find best prices
      const comparison: Record<string, any> = {};
      products.forEach((product: string) => {
        const productOffers = offers?.filter(o => 
          o.product_name.toLowerCase().includes(product.toLowerCase())
        ) || [];
        
        const bestOffer = productOffers[0];
        const stores = [...new Set(productOffers.map(o => o.store_name))];
        
        comparison[product] = {
          best_price: bestOffer?.price || null,
          best_store: bestOffer?.store_name || null,
          available_stores: stores.length,
          offers: productOffers.slice(0, 5).map(o => ({
            price: o.price,
            store: o.store_name,
            city: o.city,
            verified: o.verified
          }))
        };
      });

      // Calculate total if buying best prices
      const totalBestPrices = Object.values(comparison).reduce(
        (sum: number, item: any) => sum + (item.best_price || 0), 0
      );

      return new Response(
        JSON.stringify({
          data: {
            comparison,
            summary: {
              total_best_prices: Math.round(totalBestPrices * 100) / 100,
              products_found: Object.values(comparison).filter((c: any) => c.best_price !== null).length,
              products_requested: products.length
            }
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API Comparisons error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});