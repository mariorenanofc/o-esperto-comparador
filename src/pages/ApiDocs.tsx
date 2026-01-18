import React from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Key, Zap, BookOpen, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CodeBlock = ({ code, language = "bash" }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Código copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-muted/50 border rounded-lg p-4 overflow-x-auto text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};

const ApiDocs: React.FC = () => {
  const baseUrl = "https://diqdsmrlhldanxxrtozl.supabase.co/functions/v1";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            API v1.0
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Documentação da API
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Integre dados de preços e ofertas do O Esperto Comparador em suas aplicações
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <Key className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Autenticação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Todas as requisições precisam de uma chave de API válida
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <Zap className="h-8 w-8 text-orange-500 mb-2" />
              <CardTitle className="text-lg">Rate Limiting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                100-10.000 req/hora dependendo do plano
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <BookOpen className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle className="text-lg">OpenAPI Spec</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" asChild>
                <a href={`${baseUrl}/api-docs`} target="_blank" rel="noopener noreferrer">
                  Ver Swagger <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Endpoints */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="offers">Ofertas</TabsTrigger>
            <TabsTrigger value="comparison">Comparação</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="default">GET</Badge>
                  <CardTitle className="font-mono text-base">/api-products</CardTitle>
                </div>
                <CardDescription>
                  Lista produtos com paginação e busca
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Parâmetros de Query</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-0.5 rounded">page</code>
                      <span className="text-muted-foreground">Número da página (default: 1)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-0.5 rounded">limit</code>
                      <span className="text-muted-foreground">Itens por página (max: 100)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-0.5 rounded">search</code>
                      <span className="text-muted-foreground">Termo de busca</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-0.5 rounded">category</code>
                      <span className="text-muted-foreground">Filtrar por categoria</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Exemplo</h4>
                  <CodeBlock 
                    code={`curl -X GET "${baseUrl}/api-products?search=arroz&limit=10" \\
  -H "x-api-key: sua_chave_api"`}
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Resposta</h4>
                  <CodeBlock 
                    language="json"
                    code={`{
  "data": [
    {
      "id": "uuid",
      "name": "Arroz Tipo 1 5kg",
      "category": "Grãos e Cereais",
      "unit": "kg",
      "quantity": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasNext": true,
    "hasPrev": false
  }
}`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="default">GET</Badge>
                  <CardTitle className="font-mono text-base">/api-comparisons</CardTitle>
                </div>
                <CardDescription>
                  Lista ofertas diárias com filtros de localização
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Parâmetros de Query</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-0.5 rounded">city</code>
                      <span className="text-muted-foreground">Filtrar por cidade</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-0.5 rounded">state</code>
                      <span className="text-muted-foreground">Filtrar por estado (UF)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-0.5 rounded">verified</code>
                      <span className="text-muted-foreground">Apenas ofertas verificadas (true/false)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-0.5 rounded">hours</code>
                      <span className="text-muted-foreground">Ofertas das últimas N horas (default: 24)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Exemplo</h4>
                  <CodeBlock 
                    code={`curl -X GET "${baseUrl}/api-comparisons?city=Sao Paulo&verified=true" \\
  -H "x-api-key: sua_chave_api"`}
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Resposta</h4>
                  <CodeBlock 
                    language="json"
                    code={`{
  "data": [
    {
      "id": "uuid",
      "product_name": "Arroz Tipo 1 5kg",
      "price": 24.99,
      "store_name": "Supermercado ABC",
      "city": "São Paulo",
      "state": "SP",
      "verified": true,
      "created_at": "2025-01-18T10:00:00Z"
    }
  ],
  "pagination": { ... },
  "meta": {
    "hours_back": 24,
    "total_stores": 15,
    "avg_price": 26.50
  }
}`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600">POST</Badge>
                  <CardTitle className="font-mono text-base">/api-comparisons</CardTitle>
                </div>
                <CardDescription>
                  Compare preços de múltiplos produtos de uma vez
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Body (JSON)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-0.5 rounded">products</code>
                      <span className="text-muted-foreground">Array de nomes de produtos</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-0.5 rounded">city</code>
                      <span className="text-muted-foreground">Cidade (opcional)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-0.5 rounded">state</code>
                      <span className="text-muted-foreground">Estado (opcional)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Exemplo</h4>
                  <CodeBlock 
                    code={`curl -X POST "${baseUrl}/api-comparisons" \\
  -H "x-api-key: sua_chave_api" \\
  -H "Content-Type: application/json" \\
  -d '{
    "products": ["arroz", "feijão", "óleo"],
    "city": "São Paulo"
  }'`}
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Resposta</h4>
                  <CodeBlock 
                    language="json"
                    code={`{
  "data": {
    "comparison": {
      "arroz": {
        "best_price": 24.99,
        "best_store": "Supermercado ABC",
        "available_stores": 5,
        "offers": [...]
      },
      "feijão": { ... },
      "óleo": { ... }
    },
    "summary": {
      "total_best_prices": 45.97,
      "products_found": 3,
      "products_requested": 3
    }
  }
}`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Getting Started */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>🚀 Como Começar</CardTitle>
            <CardDescription>
              Siga estes passos para começar a usar a API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <span className="font-bold text-primary">1</span>
                </div>
                <h4 className="font-semibold mb-1">Crie uma conta</h4>
                <p className="text-sm text-muted-foreground">
                  Registre-se no O Esperto Comparador
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <span className="font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold mb-1">Gere sua API Key</h4>
                <p className="text-sm text-muted-foreground">
                  Acesse Configurações → Chaves de API
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <span className="font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold mb-1">Faça requisições</h4>
                <p className="text-sm text-muted-foreground">
                  Use o header x-api-key em todas as chamadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>⚡ Limites de Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-primary">100</p>
                <p className="text-sm text-muted-foreground">req/hora</p>
                <Badge variant="outline" className="mt-2">Gratuito</Badge>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-blue-500">1.000</p>
                <p className="text-sm text-muted-foreground">req/hora</p>
                <Badge variant="secondary" className="mt-2">Premium</Badge>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-purple-500">10.000</p>
                <p className="text-sm text-muted-foreground">req/hora</p>
                <Badge className="mt-2">Pro</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiDocs;
