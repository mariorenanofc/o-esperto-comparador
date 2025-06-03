
// Simulação da API para o ambiente Lovable
export async function POST(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split('/').slice(-2, -1)[0];
  
  // Simula aprovação
  const mockResponse = {
    id,
    status: 'approved',
    message: 'Contribuição aprovada com sucesso'
  };

  return new Response(JSON.stringify(mockResponse), {
    headers: { 'Content-Type': 'application/json' }
  });
}
