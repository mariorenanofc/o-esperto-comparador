const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const API_DOCS = {
  openapi: '3.0.0',
  info: {
    title: 'EComparador Public API',
    description: 'API pública para comparação de preços e produtos',
    version: '1.0.0',
    contact: {
      name: 'EComparador API Support',
      email: 'support@ecomparador.com.br',
    },
  },
  servers: [
    {
      url: 'https://diqdsmrlhldanxxrtozl.supabase.co/functions/v1',
      description: 'Production server',
    },
  ],
  security: [
    {
      ApiKeyAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'Sua API key do EComparador',
      },
    },
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'ID único do produto',
          },
          name: {
            type: 'string',
            description: 'Nome do produto',
          },
          category: {
            type: 'string',
            description: 'Categoria do produto',
          },
          unit: {
            type: 'string',
            description: 'Unidade de medida',
          },
          quantity: {
            type: 'integer',
            description: 'Quantidade padrão',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Data de criação',
          },
        },
      },
      Comparison: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'ID único da comparação',
          },
          user_id: {
            type: 'string',
            format: 'uuid',
            description: 'ID do usuário proprietário',
          },
          title: {
            type: 'string',
            description: 'Título da comparação',
          },
          date: {
            type: 'string',
            format: 'date-time',
            description: 'Data da comparação',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Data de criação',
          },
          comparison_products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                },
                product_id: {
                  type: 'string',
                  format: 'uuid',
                },
                products: {
                  $ref: '#/components/schemas/Product',
                },
              },
            },
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Descrição do erro',
          },
        },
      },
    },
  },
  paths: {
    '/api-products': {
      get: {
        summary: 'Listar produtos',
        description: 'Retorna lista paginada de produtos com opções de busca e filtro',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Número da página (padrão: 1)',
            schema: {
              type: 'integer',
              minimum: 1,
              default: 1,
            },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Itens por página (máximo: 100, padrão: 20)',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 20,
            },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Buscar produtos por nome',
            schema: {
              type: 'string',
            },
          },
          {
            name: 'category',
            in: 'query',
            description: 'Filtrar por categoria',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de produtos retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Product',
                      },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        total: { type: 'integer' },
                        totalPages: { type: 'integer' },
                        hasNext: { type: 'boolean' },
                        hasPrev: { type: 'boolean' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'API key inválida ou ausente',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Criar produto',
        description: 'Cria um novo produto no sistema',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: {
                    type: 'string',
                    description: 'Nome do produto (obrigatório)',
                  },
                  category: {
                    type: 'string',
                    description: 'Categoria do produto (padrão: outros)',
                  },
                  unit: {
                    type: 'string',
                    description: 'Unidade de medida (padrão: unidade)',
                  },
                  quantity: {
                    type: 'integer',
                    description: 'Quantidade (padrão: 1)',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Produto criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Product',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/api-comparisons': {
      get: {
        summary: 'Listar comparações',
        description: 'Retorna lista paginada das comparações do usuário',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Número da página (padrão: 1)',
            schema: {
              type: 'integer',
              minimum: 1,
              default: 1,
            },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Itens por página (máximo: 100, padrão: 20)',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 20,
            },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de comparações retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Comparison',
                      },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        total: { type: 'integer' },
                        totalPages: { type: 'integer' },
                        hasNext: { type: 'boolean' },
                        hasPrev: { type: 'boolean' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Criar comparação',
        description: 'Cria uma nova comparação de preços',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    description: 'Título da comparação',
                  },
                  date: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Data da comparação',
                  },
                  products: {
                    type: 'array',
                    items: {
                      type: 'string',
                      format: 'uuid',
                    },
                    description: 'IDs dos produtos a incluir na comparação',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Comparação criada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Comparison',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const HTML_DOCS = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EComparador API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
    <style>
        body { margin: 0; background: #fafafa; }
        .swagger-ui .topbar { display: none; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
    <script>
        SwaggerUIBundle({
            url: '/functions/v1/api-docs?format=json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
            ],
            plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout"
        });
    </script>
</body>
</html>
`;

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const format = url.searchParams.get('format');

    if (format === 'json') {
      return new Response(JSON.stringify(API_DOCS, null, 2), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(HTML_DOCS, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
    });

  } catch (error) {
    console.error('API Docs error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});