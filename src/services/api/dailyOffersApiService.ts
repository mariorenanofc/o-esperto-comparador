
import { DailyOffer, PriceContribution } from "@/lib/types";

export const dailyOffersApiService = {
  // GET - Buscar ofertas do dia
  async getTodaysOffers(city?: string, state?: string): Promise<DailyOffer[]> {
    try {
      let url = '/api/contributions/daily-offers';
      const params = new URLSearchParams();
      
      if (city) params.append('city', city);
      if (state) params.append('state', state);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${await getClerkToken()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch daily offers');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching daily offers:', error);
      throw error;
    }
  },

  // POST - Submeter nova contribuição de preço
  async submitPriceContribution(
    contribution: PriceContribution,
    userId: string,
    userName: string
  ): Promise<DailyOffer> {
    try {
      const response = await fetch('/api/contributions/daily-offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getClerkToken()}`,
        },
        body: JSON.stringify({
          ...contribution,
          userId,
          userName
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit contribution');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting price contribution:', error);
      throw error;
    }
  },

  // Validações locais que podem ser feitas antes de enviar para a API
  validateUserContribution(
    newContribution: PriceContribution,
    userId: string,
    existingOffers: DailyOffer[]
  ) {
    const normalizeString = (str: string): string => {
      return str
        .toLowerCase()
        .replace(/\s+/g, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    };

    const areStringsSimilar = (str1: string, str2: string): boolean => {
      const normalized1 = normalizeString(str1);
      const normalized2 = normalizeString(str2);
      
      if (normalized1 === normalized2) {
        return true;
      }
      
      return normalized1.includes(normalized2) || normalized2.includes(normalized1);
    };

    const userExistingOffer = existingOffers.find(offer => 
      offer.userId === userId &&
      areStringsSimilar(offer.productName, newContribution.productName) &&
      areStringsSimilar(offer.storeName, newContribution.storeName) &&
      normalizeString(offer.city) === normalizeString(newContribution.city)
    );

    if (userExistingOffer) {
      return {
        isValid: false,
        message: `Você já contribuiu com este produto (${userExistingOffer.productName}) no estabelecimento ${userExistingOffer.storeName}. Cada usuário pode contribuir apenas uma vez por produto em cada estabelecimento.`
      };
    }

    return { isValid: true };
  },

  validatePriceContribution(
    newContribution: PriceContribution,
    existingOffers: DailyOffer[]
  ) {
    const normalizeString = (str: string): string => {
      return str
        .toLowerCase()
        .replace(/\s+/g, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    };

    const areStringsSimilar = (str1: string, str2: string): boolean => {
      const normalized1 = normalizeString(str1);
      const normalized2 = normalizeString(str2);
      
      if (normalized1 === normalized2) {
        return true;
      }
      
      return normalized1.includes(normalized2) || normalized2.includes(normalized1);
    };

    const similarOffer = existingOffers.find(
      offer => 
        areStringsSimilar(offer.storeName, newContribution.storeName) &&
        areStringsSimilar(offer.productName, newContribution.productName) &&
        normalizeString(offer.city) === normalizeString(newContribution.city)
    );

    if (!similarOffer) {
      return { isValid: true };
    }

    const priceDifference = Math.abs(newContribution.price - similarOffer.price);
    const percentageDifference = (priceDifference / similarOffer.price) * 100;

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

// Função auxiliar para obter token do Clerk
async function getClerkToken(): Promise<string> {
  // Esta função seria implementada para obter o token de autenticação do Clerk
  // return await window.Clerk?.session?.getToken();
  return '';
}
