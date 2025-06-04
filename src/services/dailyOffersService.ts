
import { DailyOffer, PriceContribution } from "@/lib/types";
import { validationService } from "./daily-offers/validationService";
import { offerStorageService } from "./daily-offers/offerStorageService";
import { offerVerificationService } from "./daily-offers/offerVerificationService";

export const dailyOffersService = {
  // Validar se o usuário já contribuiu com o mesmo produto
  validateUserContribution: validationService.validateUserContribution,

  // Validar se o preço é muito diferente de contribuições existentes
  validatePriceContribution: validationService.validatePriceContribution,

  // Obter ofertas do dia atual
  getTodaysOffers: offerStorageService.getTodaysOffers,

  // Verificar se deve marcar como verificado
  checkIfShouldBeVerified: offerVerificationService.checkIfShouldBeVerified,

  // Marcar ofertas similares como verificadas
  markSimilarOffersAsVerified: offerVerificationService.markSimilarOffersAsVerified,

  // Submeter nova contribuição de preço
  async submitPriceContribution(
    contribution: PriceContribution,
    userId: string,
    userName: string
  ): Promise<DailyOffer> {
    console.log('Submitting price contribution:', { contribution, userId, userName });
    
    // Tentar usar API se disponível
    try {
      if (typeof window !== 'undefined' && !window.location.origin.includes('localhost')) {
        const response = await fetch('/api/contributions/daily-offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...contribution,
            userId,
            userName
          })
        });
        
        if (response.ok) {
          const apiOffer = await response.json();
          console.log('Offer submitted via API:', apiOffer);
          return apiOffer;
        }
      }
    } catch (error) {
      console.log('API not available, using local storage:', error);
    }
    
    // Fallback para armazenamento local
    // Verificar se deve ser marcado como verificado
    const existingOffers = await this.getTodaysOffers();
    const shouldBeVerified = this.checkIfShouldBeVerified(contribution, userId, existingOffers);
    
    // Criar nova oferta
    const newOffer: DailyOffer = {
      id: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productName: contribution.productName,
      price: contribution.price,
      storeName: contribution.storeName,
      city: contribution.city,
      state: contribution.state,
      contributorName: userName,
      userId: userId,
      timestamp: new Date(),
      verified: shouldBeVerified,
    };

    // Adicionar à lista temporária
    offerStorageService.addOffer(newOffer);
    
    // Se a nova oferta foi verificada, marcar ofertas similares existentes como verificadas
    if (shouldBeVerified) {
      this.markSimilarOffersAsVerified(contribution, userId);
    }
    
    return newOffer;
  },

  // Limpar ofertas antigas (executar diariamente)
  clearOldOffers: offerStorageService.clearOldOffers,

  // Função para debug - listar todas as ofertas
  debugGetAllOffers: offerStorageService.debugGetAllOffers
};
