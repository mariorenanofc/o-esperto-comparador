
import { DailyOffer, PriceContribution, PriceValidationResult } from "@/lib/types";

// Armazenamento temporário em memória (será perdido ao recarregar a página)
// Em produção, isso será substituído pela API do banco de dados
let todaysOffers: DailyOffer[] = [];

// Função para normalizar strings (remover espaços, converter para minúsculo, remover acentos)
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/\s+/g, '') // Remove todos os espaços
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
};

// Função para verificar se duas strings são similares (mesmo produto/loja)
const areStringsSimilar = (str1: string, str2: string): boolean => {
  const normalized1 = normalizeString(str1);
  const normalized2 = normalizeString(str2);
  
  // Verifica correspondência exata após normalização
  if (normalized1 === normalized2) {
    return true;
  }
  
  // Verifica se uma string contém a outra (para variações como "Arroz Tipo 1" vs "Arroz")
  return normalized1.includes(normalized2) || normalized2.includes(normalized1);
};

export const dailyOffersService = {
  // Validar se o usuário já contribuiu com o mesmo produto
  validateUserContribution(
    newContribution: PriceContribution,
    userId: string,
    existingOffers: DailyOffer[]
  ): PriceValidationResult {
    console.log('Validating user contribution:', { newContribution, userId });
    
    // Verificar se o usuário já adicionou o mesmo produto no mesmo estabelecimento
    const userExistingOffer = existingOffers.find(offer => 
      offer.userId === userId &&
      areStringsSimilar(offer.productName, newContribution.productName) &&
      areStringsSimilar(offer.storeName, newContribution.storeName) &&
      normalizeString(offer.city) === normalizeString(newContribution.city)
    );

    if (userExistingOffer) {
      console.log('User already contributed this product:', userExistingOffer);
      return {
        isValid: false,
        message: `Você já contribuiu com este produto (${userExistingOffer.productName}) no estabelecimento ${userExistingOffer.storeName}. Cada usuário pode contribuir apenas uma vez por produto em cada estabelecimento.`
      };
    }

    return { isValid: true };
  },

  // Validar se o preço é muito diferente de contribuições existentes
  validatePriceContribution(
    newContribution: PriceContribution,
    existingOffers: DailyOffer[]
  ): PriceValidationResult {
    console.log('Validating price contribution:', newContribution);
    console.log('Against existing offers:', existingOffers);
    
    const similarOffer = existingOffers.find(
      offer => 
        areStringsSimilar(offer.storeName, newContribution.storeName) &&
        areStringsSimilar(offer.productName, newContribution.productName) &&
        normalizeString(offer.city) === normalizeString(newContribution.city)
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

  // Verificar se deve marcar como verificado
  checkIfShouldBeVerified(
    newContribution: PriceContribution,
    userId: string,
    existingOffers: DailyOffer[]
  ): boolean {
    // Procurar por ofertas similares de outros usuários
    const similarOfferFromOtherUser = existingOffers.find(offer => 
      offer.userId !== userId && // Deve ser de outro usuário
      areStringsSimilar(offer.productName, newContribution.productName) &&
      areStringsSimilar(offer.storeName, newContribution.storeName) &&
      normalizeString(offer.city) === normalizeString(newContribution.city)
    );

    return !!similarOfferFromOtherUser;
  },

  // Marcar ofertas similares como verificadas
  markSimilarOffersAsVerified(
    newContribution: PriceContribution,
    userId: string
  ): void {
    todaysOffers.forEach(offer => {
      if (
        offer.userId !== userId && // Não marcar ofertas do mesmo usuário
        areStringsSimilar(offer.productName, newContribution.productName) &&
        areStringsSimilar(offer.storeName, newContribution.storeName) &&
        normalizeString(offer.city) === normalizeString(newContribution.city)
      ) {
        offer.verified = true;
        console.log('Marked offer as verified:', offer.id);
      }
    });
  },

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
    todaysOffers.push(newOffer);
    
    // Se a nova oferta foi verificada, marcar ofertas similares existentes como verificadas
    if (shouldBeVerified) {
      this.markSimilarOffersAsVerified(contribution, userId);
    }
    
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
