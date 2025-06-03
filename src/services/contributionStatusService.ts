
import { DailyOffer } from "@/lib/types";

// Tipo para gerenciar o estado das contribuições
interface ContributionStatus {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  updatedAt: Date;
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
      updatedAt: new Date()
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
    return contribution ? contribution.status : 'pending';
  },

  // Obter todas as contribuições com status
  getAllContributionStatuses(): ContributionStatus[] {
    return [...contributionStatuses];
  },

  // Verificar se uma contribuição foi rejeitada
  isContributionRejected(id: string): boolean {
    const contribution = contributionStatuses.find(c => c.id === id);
    return contribution?.status === 'rejected';
  },

  // Verificar se uma contribuição foi aprovada
  isContributionApproved(id: string): boolean {
    const contribution = contributionStatuses.find(c => c.id === id);
    return contribution?.status === 'approved';
  },

  // Limpar contribuições antigas (executar diariamente)
  clearOldStatuses(): void {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    contributionStatuses = contributionStatuses.filter(
      status => status.updatedAt > oneDayAgo
    );
  }
};

// Executar limpeza automática a cada hora
setInterval(() => {
  contributionStatusService.clearOldStatuses();
}, 60 * 60 * 1000); // 1 hora
