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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient<Database>(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  try {
    // Get API key from header
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate API key and get user info
    const { data: keyValidation, error: keyError } = await supabaseClient.rpc(
      'validate_api_key',
      { api_key_input: apiKey }
    );

    if (keyError || !keyValidation?.valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check rate limit
    const { data: rateLimitOk } = await supabaseClient.rpc(
      'check_api_rate_limit',
      {
        api_key_input: apiKey,
        endpoint_name: 'comparisons',
        max_requests_per_hour: keyValidation.rate_limit || 1000,
      }
    );

    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userId = keyValidation.user_id;
    const url = new URL(req.url);
    const method = req.method;

    // GET /api/v1/comparisons - List user's comparisons
    if (method === 'GET') {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
      const offset = (page - 1) * limit;

      const { data: comparisons, error, count } = await supabaseClient
        .from('comparisons')
        .select('*, comparison_products(id, product_id, products(name, category))', { count: 'exact' })
        .eq('user_id', userId)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return new Response(
        JSON.stringify({
          data: comparisons,
          pagination: {
            page,
            limit,
            total: count,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // POST /api/v1/comparisons - Create new comparison
    if (method === 'POST') {
      const body = await req.json();
      
      const comparisonData = {
        user_id: userId,
        title: body.title || `Comparação ${new Date().toLocaleDateString('pt-BR')}`,
        date: body.date || new Date().toISOString(),
      };

      const { data: newComparison, error } = await supabaseClient
        .from('comparisons')
        .insert(comparisonData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add products to comparison if provided
      if (body.products && Array.isArray(body.products)) {
        const comparisonProducts = body.products.map((productId: string) => ({
          comparison_id: newComparison.id,
          product_id: productId,
        }));

        await supabaseClient
          .from('comparison_products')
          .insert(comparisonProducts);
      }

      // Fetch complete comparison with products
      const { data: completeComparison } = await supabaseClient
        .from('comparisons')
        .select('*, comparison_products(id, product_id, products(name, category))')
        .eq('id', newComparison.id)
        .single();

      return new Response(
        JSON.stringify({ data: completeComparison }),
        {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('API Comparisons error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});