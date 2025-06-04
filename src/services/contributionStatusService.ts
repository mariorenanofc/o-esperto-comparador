
import { DailyOffer } from "@/lib/types";

// Tipo para gerenciar o estado das contribuições
interface ContributionStatus {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  updatedAt: Date;
  createdAt: Date; // Adicionar data de criação para controle de 24h
}

// Armazenamento em memória para o estado das contribuições
let contributionStatuses: ContributionStatus[] = [];

export const contributionStatusService = {
  // Atualizar status de uma contribuição
  updateContributionStatus(id: string, status: 'approved' | 'rejected'): void {
    console.log(`Updating contribution ${id} to ${status}`);
    
    // Atualizar ou adicionar o status
    const existingIndex = contributionStatuses.findIndex(c => c.id === id);
    const statusUpdate: ContributionStatus = {
      id,
      status,
      updatedAt: new Date(),
      createdAt: existingIndex >= 0 ? contributionStatuses[existingIndex].createdAt : new Date()
    };
    
    if (existingIndex >= 0) {
      contributionStatuses[existingIndex] = statusUpdate;
    } else {
      contributionStatuses.push(statusUpdate);
    }
    
    // Disparar evento customizado para notificar outros componentes
    window.dispatchEvent(new CustomEvent('contributionStatusUpdated', {
      detail: { id, status }
    }));
  },

  // Obter status de uma contribuição
  getContributionStatus(id: string): 'pending' | 'approved' | 'rejected' {
    const contribution = contributionStatuses.find(c => c.id === id);
    
    // Verificar se a contribuição ainda está dentro do prazo de 24h
    if (contribution) {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      
      if (contribution.createdAt.getTime() < twentyFourHoursAgo.getTime()) {
        // Contribuição expirou, remover e retornar como pendente
        this.removeExpiredContribution(id);
        return 'pending';
      }
    }
    
    return contribution ? contribution.status : 'pending';
  },

  // Obter todas as contribuições com status (apenas das últimas 24h)
  getAllContributionStatuses(): ContributionStatus[] {
    this.clearExpiredContributions();
    return [...contributionStatuses];
  },

  // Verificar se uma contribuição foi rejeitada
  isContributionRejected(id: string): boolean {
    const status = this.getContributionStatus(id);
    return status === 'rejected';
  },

  // Verificar se uma contribuição foi aprovada
  isContributionApproved(id: string): boolean {
    const status = this.getContributionStatus(id);
    return status === 'approved';
  },

  // Remover contribuição específica expirada
  removeExpiredContribution(id: string): void {
    contributionStatuses = contributionStatuses.filter(status => status.id !== id);
  },

  // Limpar contribuições expiradas (mais de 24 horas)
  clearExpiredContributions(): void {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    const initialCount = contributionStatuses.length;
    
    contributionStatuses = contributionStatuses.filter(
      status => status.createdAt.getTime() > twentyFourHoursAgo.getTime()
    );
    
    if (initialCount !== contributionStatuses.length) {
      console.log(`Contribution statuses cleanup: ${initialCount} -> ${contributionStatuses.length}`);
    }
  }
};

// Executar limpeza automática a cada 30 minutos
setInterval(() => {
  contributionStatusService.clearExpiredContributions();
}, 30 * 60 * 1000); // 30 minutos
