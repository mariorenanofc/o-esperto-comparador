
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
}

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

  // Sugestões
  async submitSuggestion(userId: string, data: SuggestionData): Promise<DatabaseSuggestion> {
    console.log('Submitting suggestion:', { userId, data });
    
    // TODO: Implementar chamada para API/Prisma
    // const response = await fetch('/api/suggestions', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId, ...data })
    // });
    // return response.json();
    
    // Mock response por enquanto
    return {
      id: `suggestion_${Date.now()}`,
      userId,
      title: data.title,
      description: data.description,
      category: data.category,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async getSuggestions(userId: string): Promise<DatabaseSuggestion[]> {
    console.log('Getting suggestions for user:', userId);
    
    // TODO: Implementar chamada para API/Prisma
    // const response = await fetch(`/api/suggestions?userId=${userId}`);
    // return response.json();
    
    return [];
  },
};
