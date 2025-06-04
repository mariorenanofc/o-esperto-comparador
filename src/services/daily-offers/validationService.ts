
import { DailyOffer, PriceContribution, PriceValidationResult } from "@/lib/types";

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

export const validationService = {
  normalizeString,
  areStringsSimilar,

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
  }
};
