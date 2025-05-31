
import { DailyOffer, PriceContribution, PriceValidationResult } from "@/lib/types";

export const dailyOffersService = {
  // Validar se o preço é muito diferente de contribuições existentes
  validatePriceContribution(
    newContribution: PriceContribution,
    existingOffers: DailyOffer[]
  ): PriceValidationResult {
    const similarOffer = existingOffers.find(
      offer => 
        offer.productName.toLowerCase().includes(newContribution.productName.toLowerCase()) ||
        newContribution.productName.toLowerCase().includes(offer.productName.toLowerCase())
    );

    if (!similarOffer) {
      return { isValid: true };
    }

    const priceDifference = Math.abs(newContribution.price - similarOffer.price);
    const percentageDifference = (priceDifference / similarOffer.price) * 100;

    // Se a diferença for maior que 30%, considerar suspeito
    if (percentageDifference > 30) {
      return {
        isValid: false,
        conflictingPrice: similarOffer.price,
        conflictingContributor: similarOffer.contributorName,
        priceDifference: percentageDifference,
      };
    }

    return { isValid: true };
  },

  // Obter ofertas do dia atual
  async getTodaysOffers(): Promise<DailyOffer[]> {
    // TODO: Implementar chamada para API/banco de dados
    console.log('Getting today\'s offers...');
    
    // Mock data por enquanto
    return [];
  },

  // Submeter nova contribuição de preço
  async submitPriceContribution(
    contribution: PriceContribution,
    userId: string
  ): Promise<DailyOffer> {
    console.log('Submitting price contribution:', { contribution, userId });
    
    // TODO: Implementar chamada para API/banco de dados
    // const response = await fetch('/api/daily-offers', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ ...contribution, userId })
    // });
    
    // Mock response por enquanto
    return {
      id: `offer_${Date.now()}`,
      productName: contribution.productName,
      price: contribution.price,
      storeName: contribution.storeName,
      city: contribution.city,
      state: contribution.state,
      contributorName: "Usuário Anônimo",
      timestamp: new Date(),
      verified: false,
    };
  },

  // Limpar ofertas antigas (executar diariamente)
  async clearOldOffers(): Promise<void> {
    console.log('Clearing old offers...');
    // TODO: Implementar limpeza automática de ofertas do dia anterior
  }
};
