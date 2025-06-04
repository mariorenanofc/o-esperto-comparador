
import { DailyOffer } from "@/lib/types";

// Armazenamento temporário em memória (será perdido ao recarregar a página)
// Em produção, isso será substituído pela API do banco de dados
let todaysOffers: DailyOffer[] = [];

export const offerStorageService = {
  // Obter ofertas do dia atual
  async getTodaysOffers(): Promise<DailyOffer[]> {
    console.log('Getting today\'s offers...');
    
    // Tentar usar API se disponível
    try {
      if (typeof window !== 'undefined' && !window.location.origin.includes('localhost')) {
        const response = await fetch('/api/contributions/daily-offers');
        if (response.ok) {
          const apiOffers = await response.json();
          console.log('Offers fetched from API:', apiOffers);
          return apiOffers;
        }
      }
    } catch (error) {
      console.log('API not available, using local storage:', error);
    }
    
    // Fallback para armazenamento local
    console.log('Total offers in memory:', todaysOffers.length);
    
    // Filtrar apenas ofertas do dia atual
    const today = new Date();
    const todayString = today.toDateString();
    
    const filteredOffers = todaysOffers.filter(offer => {
      const offerDate = offer.timestamp.toDateString();
      console.log('Comparing offer date:', offerDate, 'with today:', todayString);
      return offerDate === todayString;
    });
    
    console.log('Filtered offers for today:', filteredOffers);
    return filteredOffers;
  },

  // Adicionar nova oferta
  addOffer(newOffer: DailyOffer): void {
    todaysOffers.push(newOffer);
    console.log('New offer added:', newOffer);
    console.log('Total offers now:', todaysOffers.length);
    console.log('All offers in memory:', todaysOffers);
  },

  // Atualizar ofertas existentes
  updateOffers(updateFn: (offers: DailyOffer[]) => void): void {
    updateFn(todaysOffers);
  },

  // Limpar ofertas antigas (executar diariamente)
  async clearOldOffers(): Promise<void> {
    console.log('Clearing old offers...');
    const today = new Date();
    const todayString = today.toDateString();
    
    const initialCount = todaysOffers.length;
    
    // Manter apenas ofertas de hoje
    todaysOffers = todaysOffers.filter(offer => {
      const offerDate = offer.timestamp.toDateString();
      return offerDate === todayString;
    });
    
    console.log(`Offers cleanup: ${initialCount} -> ${todaysOffers.length}`);
  },

  // Função para debug - listar todas as ofertas
  debugGetAllOffers(): DailyOffer[] {
    console.log('DEBUG: All offers in memory:', todaysOffers);
    return [...todaysOffers];
  }
};

// Executar limpeza automática a cada hora
setInterval(() => {
  offerStorageService.clearOldOffers();
}, 60 * 60 * 1000); // 1 hora
