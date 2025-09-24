import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          category: string;
          unit: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          name: string;
          category?: string;
          unit?: string;
          quantity?: number;
        };
        Update: {
          name?: string;
          category?: string;
          unit?: string;
          quantity?: number;
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

    // Validate API key and check rate limit
    const { data: keyValidation, error: keyError } = await supabaseClient.rpc(
      'check_api_rate_limit',
      {
        api_key_input: apiKey,
        endpoint_name: 'products',
        max_requests_per_hour: 1000,
      }
    );

    if (keyError || !keyValidation) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key or rate limit exceeded' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const url = new URL(req.url);
    const method = req.method;

    // GET /api/v1/products - List products with pagination and search
    if (method === 'GET') {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
      const search = url.searchParams.get('search') || '';
      const category = url.searchParams.get('category') || '';
      const offset = (page - 1) * limit;

      let query = supabaseClient
        .from('products')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data: products, error, count } = await query;

      if (error) {
        throw error;
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return new Response(
        JSON.stringify({
          data: products,
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

    // POST /api/v1/products - Create new product
    if (method === 'POST') {
      const body = await req.json();
      
      if (!body.name || typeof body.name !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Product name is required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const productData = {
        name: body.name.trim(),
        category: body.category || 'outros',
        unit: body.unit || 'unidade',
        quantity: body.quantity || 1,
      };

      const { data: newProduct, error } = await supabaseClient
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ data: newProduct }),
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
    console.error('API Products error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});