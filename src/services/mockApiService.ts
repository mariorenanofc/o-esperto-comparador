
// Serviço mock para simular APIs do servidor no ambiente Lovable
export const mockApiService = {
  // Simula aprovação de contribuição
  async approveContribution(id: string) {
    console.log(`Mock: Aprovando contribuição ${id}`);
    return {
      id,
      status: 'approved',
      message: 'Contribuição aprovada com sucesso'
    };
  },

  // Simula rejeição de contribuição
  async rejectContribution(id: string) {
    console.log(`Mock: Rejeitando contribuição ${id}`);
    return {
      id,
      status: 'rejected',
      message: 'Contribuição rejeitada'
    };
  },

  // Simula busca de contribuições pendentes
  async getPendingContributions() {
    console.log('Mock: Buscando contribuições pendentes');
    return [
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
  }
};
