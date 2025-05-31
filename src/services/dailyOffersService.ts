
import { DailyOffer, PriceContribution, PriceValidationResult } from "@/lib/types";

// Armazenamento temporário em memória (será perdido ao recarregar a página)
// Em produção, isso seria substituído por um banco de dados
let todaysOffers: DailyOffer[] = [];

export const dailyOffersService = {
  // Validar se o preço é muito diferente de contribuições existentes
  validatePriceContribution(
    newContribution: PriceContribution,
    existingOffers: DailyOffer[]
  ): PriceValidationResult {
    const similarOffer = existingOffers.find(
      offer => 
        offer.storeName.toLowerCase() === newContribution.storeName.toLowerCase() &&
        (offer.productName.toLowerCase().includes(newContribution.productName.toLowerCase()) ||
        newContribution.productName.toLowerCase().includes(offer.productName.toLowerCase()))
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
    console.log('Getting today\'s offers...');
    
    // Filtrar apenas ofertas do dia atual
    const today = new Date();
    const todayString = today.toDateString();
    
    const filteredOffers = todaysOffers.filter(offer => 
      offer.timestamp.toDateString() === todayString
    );
    
    console.log('Filtered offers for today:', filteredOffers);
    return filteredOffers;
  },

  // Submeter nova contribuição de preço
  async submitPriceContribution(
    contribution: PriceContribution,
    userId: string
  ): Promise<DailyOffer> {
    console.log('Submitting price contribution:', { contribution, userId });
    
    // Criar nova oferta
    const newOffer: DailyOffer = {
      id: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productName: contribution.productName,
      price: contribution.price,
      storeName: contribution.storeName,
      city: contribution.city,
      state: contribution.state,
      contributorName: "Usuário Anônimo", // TODO: Pegar nome real do usuário
      timestamp: new Date(),
      verified: false,
    };

    // Adicionar à lista temporária
    todaysOffers.push(newOffer);
    
    console.log('New offer added:', newOffer);
    console.log('Total offers now:', todaysOffers.length);
    
    return newOffer;
  },

  // Limpar ofertas antigas (executar diariamente)
  async clearOldOffers(): Promise<void> {
    console.log('Clearing old offers...');
    const today = new Date();
    const todayString = today.toDateString();
    
    // Manter apenas ofertas de hoje
    todaysOffers = todaysOffers.filter(offer => 
      offer.timestamp.toDateString() === todayString
    );
    
    console.log('Offers after cleanup:', todaysOffers.length);
  }
};

// Executar limpeza automática a cada hora
setInterval(() => {
  dailyOffersService.clearOldOffers();
}, 60 * 60 * 1000); // 1 hora
