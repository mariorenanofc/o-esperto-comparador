
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
    console.log('Validating price contribution:', newContribution);
    console.log('Against existing offers:', existingOffers);
    
    const similarOffer = existingOffers.find(
      offer => 
        offer.storeName.toLowerCase() === newContribution.storeName.toLowerCase() &&
        (offer.productName.toLowerCase().includes(newContribution.productName.toLowerCase()) ||
        newContribution.productName.toLowerCase().includes(offer.productName.toLowerCase()))
    );

    if (!similarOffer) {
      console.log('No similar offer found, validation passed');
      return { isValid: true };
    }

    const priceDifference = Math.abs(newContribution.price - similarOffer.price);
    const percentageDifference = (priceDifference / similarOffer.price) * 100;

    console.log('Similar offer found:', similarOffer);
    console.log('Price difference:', priceDifference, 'Percentage:', percentageDifference);

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
    console.log('All offers in memory:', todaysOffers);
    
    return newOffer;
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
  dailyOffersService.clearOldOffers();
}, 60 * 60 * 1000); // 1 hora
