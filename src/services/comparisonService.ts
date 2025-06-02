
import { ComparisonData } from '@/lib/types';
import { DatabaseComparison, ComparisonWithDetails } from '@/lib/database-types';

export const comparisonService = {
  // GET - Buscar comparações do usuário
  async getUserComparisons(userId: string): Promise<ComparisonWithDetails[]> {
    try {
      // Tentar usar API se disponível
      if (typeof window !== 'undefined' && window.location.origin.includes('localhost')) {
        // Em desenvolvimento local, usar mock
        console.log('getUserComparisons called with userId:', userId);
        return [];
      }
      
      // Em produção, usar API real
      const response = await fetch(`/api/comparisons?userId=${userId}`);
      if (response.ok) {
        return await response.json();
      }
      
      console.log('getUserComparisons called with userId:', userId);
      return [];
    } catch (error) {
      console.error('Error fetching user comparisons:', error);
      return [];
    }
  },

  // POST - Salvar nova comparação
  async saveComparison(comparisonData: ComparisonData & { userId: string }): Promise<DatabaseComparison> {
    try {
      // Tentar usar API se disponível
      if (typeof window !== 'undefined' && !window.location.origin.includes('localhost')) {
        const response = await fetch('/api/comparisons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(comparisonData)
        });
        
        if (response.ok) {
          return await response.json();
        }
      }
      
      console.log('saveComparison called with data:', comparisonData);
      return {} as DatabaseComparison;
    } catch (error) {
      console.error('Error saving comparison:', error);
      throw error;
    }
  },

  // PUT - Atualizar comparação existente
  async updateComparison(comparisonId: string, comparisonData: Partial<ComparisonData>): Promise<DatabaseComparison> {
    try {
      // Tentar usar API se disponível
      if (typeof window !== 'undefined' && !window.location.origin.includes('localhost')) {
        const response = await fetch(`/api/comparisons/${comparisonId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(comparisonData)
        });
        
        if (response.ok) {
          return await response.json();
        }
      }
      
      console.log('updateComparison called with id:', comparisonId, 'data:', comparisonData);
      return {} as DatabaseComparison;
    } catch (error) {
      console.error('Error updating comparison:', error);
      throw error;
    }
  },

  // DELETE - Deletar comparação
  async deleteComparison(comparisonId: string): Promise<void> {
    try {
      // Tentar usar API se disponível
      if (typeof window !== 'undefined' && !window.location.origin.includes('localhost')) {
        const response = await fetch(`/api/comparisons/${comparisonId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          return;
        }
      }
      
      console.log('deleteComparison called with id:', comparisonId);
    } catch (error) {
      console.error('Error deleting comparison:', error);
      throw error;
    }
  }
};
