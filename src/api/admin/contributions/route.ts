
// Simulação da API para o ambiente Lovable
// No ambiente real, use Next.js com Clerk e Prisma
export async function GET() {
  // Retorna dados mockados para funcionar no Lovable
  const mockContributions = [
    {
      id: '1',
      price: 5.99,
      status: 'pending',
      createdAt: new Date().toISOString(),
      user: {
        name: 'João Silva',
        email: 'joao@example.com'
      },
      product: {
        name: 'Sabão em Pó Ala',
        quantity: 1,
        unit: 'kg'
      },
      store: {
        name: 'Supermercado ABC'
      }
    }
  ];

  return new Response(JSON.stringify(mockContributions), {
    headers: { 'Content-Type': 'application/json' }
  });
}
