
import { DailyOffer } from "@/lib/types";

// Armazenamento temporário em memória (será perdido ao recarregar a página)
// Em produção, isso será substituído pela API do banco de dados
let todaysOffers: DailyOffer[] = [];

const isDevelopment = process.env.NODE_ENV === 'development';

export const offerStorageService = {
  // Obter ofertas do dia atual
  async getTodaysOffers(): Promise<DailyOffer[]> {
    // Limpar ofertas antigas automaticamente a cada consulta
    await this.clearOldOffers();
    
    // Tentar usar API se disponível
    try {
      if (typeof window !== 'undefined' && !window.location.origin.includes('localhost')) {
        const response = await fetch('/api/contributions/daily-offers');
        if (response.ok) {
          const apiOffers = await response.json();
          return apiOffers;
        }
      }
    } catch (error) {
      // Fallback silencioso para armazenamento local
    }
    
    // Fallback para armazenamento local
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    const filteredOffers = todaysOffers.filter(offer => {
      const offerTime = offer.timestamp.getTime();
      return offerTime > twentyFourHoursAgo.getTime();
    });
    
    return filteredOffers;
  },

  // Adicionar nova oferta
  addOffer(newOffer: DailyOffer): void {
    todaysOffers.push(newOffer);
  },

  // Atualizar ofertas existentes
  updateOffers(updateFn: (offers: DailyOffer[]) => void): void {
    updateFn(todaysOffers);
  },

  // Limpar ofertas antigas (executar automaticamente - agora remove após 24h)
  async clearOldOffers(): Promise<void> {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    const initialCount = todaysOffers.length;
    
    // Manter apenas ofertas das últimas 24 horas
    todaysOffers = todaysOffers.filter(offer => {
      const offerTime = offer.timestamp.getTime();
      return offerTime > twentyFourHoursAgo.getTime();
    });
    
    if (isDevelopment) {
      console.log(`Offers cleanup: ${initialCount} -> ${todaysOffers.length}`);
    }
  },

  // Função para debug - apenas em desenvolvimento
  ...(isDevelopment && {
    debugGetAllOffers(): DailyOffer[] {
      console.log('DEBUG: All offers in memory:', todaysOffers);
      return [...todaysOffers];
    }
  })
};

// Executar limpeza automática a cada 30 minutos para manter o sistema limpo
setInterval(() => {
  offerStorageService.clearOldOffers();
}, 30 * 60 * 1000); // 30 minutos
