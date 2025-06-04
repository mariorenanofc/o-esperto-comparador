
import { DatabasePriceContribution, DatabaseSuggestion } from "@/lib/database-types";

export interface PriceContributionData {
  productName: string;
  storeName: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface SuggestionData {
  title: string;
  description: string;
  category: 'improvement' | 'feature' | 'bug' | 'other';
  userName: string;
  userEmail: string;
  userPhone: string;
}

export interface UserFeedback extends SuggestionData {
  id: string;
  userId: string;
  createdAt: Date;
  status: 'new' | 'reviewed' | 'resolved';
}

// Armazenamento temporário para feedbacks (em produção seria no banco)
let userFeedbacks: UserFeedback[] = [];

// Estrutura para comunicação com API/Banco de dados
export const contributionService = {
  // Contribuições de preços
  async submitPriceContribution(userId: string, data: PriceContributionData): Promise<DatabasePriceContribution> {
    console.log('Submitting price contribution:', { userId, data });
    
    // TODO: Implementar chamada para API/Prisma
    // Exemplo de implementação futura:
    // const response = await fetch('/api/contributions/prices', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId, ...data })
    // });
    // return response.json();
    
    // Mock response por enquanto
    return {
      id: `price_${Date.now()}`,
      userId,
      productId: 'mock_product_id',
      storeId: 'mock_store_id',
      price: data.price,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async getPriceContributions(userId: string): Promise<DatabasePriceContribution[]> {
    console.log('Getting price contributions for user:', userId);
    
    // TODO: Implementar chamada para API/Prisma
    // const response = await fetch(`/api/contributions/prices?userId=${userId}`);
    // return response.json();
    
    return [];
  },

  // Sugestões/Feedbacks
  async submitSuggestion(userId: string, data: SuggestionData): Promise<UserFeedback> {
    console.log('Submitting suggestion/feedback:', { userId, data });
    
    const feedback: UserFeedback = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...data,
      createdAt: new Date(),
      status: 'new',
    };

    // Adicionar ao armazenamento temporário
    userFeedbacks.push(feedback);
    console.log('Feedback stored:', feedback);
    
    // TODO: Implementar chamada para API/Prisma
    // const response = await fetch('/api/suggestions', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId, ...data })
    // });
    // return response.json();
    
    return feedback;
  },

  async getSuggestions(userId: string): Promise<DatabaseSuggestion[]> {
    console.log('Getting suggestions for user:', userId);
    
    // TODO: Implementar chamada para API/Prisma
    // const response = await fetch(`/api/suggestions?userId=${userId}`);
    // return response.json();
    
    return [];
  },

  // Funções para administradores gerenciarem feedbacks
  async getAllFeedbacks(): Promise<UserFeedback[]> {
    console.log('Getting all user feedbacks for admin');
    
    // Remover feedbacks antigos (mais de 24 horas)
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    userFeedbacks = userFeedbacks.filter(
      feedback => feedback.createdAt.getTime() > twentyFourHoursAgo.getTime()
    );
    
    return [...userFeedbacks];
  },

  async updateFeedbackStatus(feedbackId: string, status: 'new' | 'reviewed' | 'resolved'): Promise<void> {
    console.log(`Updating feedback ${feedbackId} to status: ${status}`);
    
    const feedbackIndex = userFeedbacks.findIndex(f => f.id === feedbackId);
    if (feedbackIndex >= 0) {
      userFeedbacks[feedbackIndex].status = status;
    }
  }
};
