
import { contributionStatusService } from './contributionStatusService';

// Serviço mock para simular APIs do servidor no ambiente Lovable
export const mockApiService = {
  // Simula aprovação de contribuição
  async approveContribution(id: string) {
    console.log(`Mock: Aprovando contribuição ${id}`);
    
    // Atualizar o status da contribuição
    contributionStatusService.updateContributionStatus(id, 'approved');
    
    return {
      id,
      status: 'approved' as const,
      message: 'Contribuição aprovada com sucesso'
    };
  },

  // Simula rejeição de contribuição
  async rejectContribution(id: string) {
    console.log(`Mock: Rejeitando contribuição ${id}`);
    
    // Atualizar o status da contribuição
    contributionStatusService.updateContributionStatus(id, 'rejected');
    
    return {
      id,
      status: 'rejected' as const,
      message: 'Contribuição rejeitada'
    };
  },

  // Simula busca de contribuições pendentes
  async getPendingContributions() {
    console.log('Mock: Buscando contribuições pendentes');
    
    // Filtrar apenas contribuições que ainda estão pendentes
    const allStatuses = contributionStatusService.getAllContributionStatuses();
    const pendingIds = allStatuses
      .filter(status => status.status === 'pending')
      .map(status => status.id);
    
    // Retornar apenas contribuições pendentes (simulação)
    const mockContributions = [
      {
        id: '1',
        price: 5.99,
        status: 'pending' as const,
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

    // Filtrar contribuições que não foram aprovadas ou rejeitadas
    return mockContributions.filter(contribution => {
      const status = contributionStatusService.getContributionStatus(contribution.id);
      return status === 'pending';
    });
  }
};
