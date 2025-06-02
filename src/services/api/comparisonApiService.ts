
import { ComparisonData } from '@/lib/types';
import { DatabaseComparison, ComparisonWithDetails } from '@/lib/database-types';

export const comparisonApiService = {
  // GET - Buscar comparações do usuário
  async getUserComparisons(userId: string): Promise<ComparisonWithDetails[]> {
    try {
      const response = await fetch(`/api/comparisons?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${await getClerkToken()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch comparisons');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user comparisons:', error);
      throw error;
    }
  },

  // POST - Salvar nova comparação
  async saveComparison(comparisonData: ComparisonData): Promise<DatabaseComparison> {
    try {
      const response = await fetch('/api/comparisons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getClerkToken()}`,
        },
        body: JSON.stringify(comparisonData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save comparison');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving comparison:', error);
      throw error;
    }
  },

  // PUT - Atualizar comparação existente
  async updateComparison(comparisonId: string, comparisonData: Partial<ComparisonData>): Promise<DatabaseComparison> {
    try {
      const response = await fetch(`/api/comparisons/${comparisonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getClerkToken()}`,
        },
        body: JSON.stringify(comparisonData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update comparison');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating comparison:', error);
      throw error;
    }
  },

  // DELETE - Deletar comparação
  async deleteComparison(comparisonId: string): Promise<void> {
    try {
      const response = await fetch(`/api/comparisons/${comparisonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await getClerkToken()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete comparison');
      }
    } catch (error) {
      console.error('Error deleting comparison:', error);
      throw error;
    }
  }
};

// Função auxiliar para obter token do Clerk
async function getClerkToken(): Promise<string> {
  // Esta função seria implementada para obter o token de autenticação do Clerk
  // return await window.Clerk?.session?.getToken();
  return '';
}
