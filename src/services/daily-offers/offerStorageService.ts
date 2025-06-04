
import { DailyOffer } from "@/lib/types";

// Armazenamento temporário em memória (será perdido ao recarregar a página)
// Em produção, isso será substituído pela API do banco de dados
let todaysOffers: DailyOffer[] = [];

export const offerStorageService = {
  // Obter ofertas do dia atual
  async getTodaysOffers(): Promise<DailyOffer[]> {
    console.log('Getting today\'s offers...');
    
    // Limpar ofertas antigas automaticamente a cada consulta
    await this.clearOldOffers();
    
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
    
    // Filtrar apenas ofertas do dia atual (últimas 24 horas)
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    const filteredOffers = todaysOffers.filter(offer => {
      const offerTime = offer.timestamp.getTime();
      const isWithin24Hours = offerTime > twentyFourHoursAgo.getTime();
      console.log('Checking offer:', offer.id, 'timestamp:', offer.timestamp, 'within 24h:', isWithin24Hours);
      return isWithin24Hours;
    });
    
    console.log('Filtered offers for last 24 hours:', filteredOffers);
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

  // Limpar ofertas antigas (executar automaticamente - agora remove após 24h)
  async clearOldOffers(): Promise<void> {
    console.log('Clearing old offers (older than 24 hours)...');
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    const initialCount = todaysOffers.length;
    
    // Manter apenas ofertas das últimas 24 horas
    todaysOffers = todaysOffers.filter(offer => {
      const offerTime = offer.timestamp.getTime();
      return offerTime > twentyFourHoursAgo.getTime();
    });
    
    console.log(`Offers cleanup: ${initialCount} -> ${todaysOffers.length}`);
  },

  // Função para debug - listar todas as ofertas
  debugGetAllOffers(): DailyOffer[] {
    console.log('DEBUG: All offers in memory:', todaysOffers);
    return [...todaysOffers];
  }
};

// Executar limpeza automática a cada 30 minutos para manter o sistema limpo
setInterval(() => {
  offerStorageService.clearOldOffers();
}, 30 * 60 * 1000); // 30 minutos
