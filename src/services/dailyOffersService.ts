
import { DailyOffer, PriceContribution } from "@/lib/types";
import { supabaseDailyOffersService } from "./supabase/dailyOffersService";
import { validationService } from "./daily-offers/validationService";

export const dailyOffersService = {
  // Usar serviços do Supabase
  getTodaysOffers: supabaseDailyOffersService.getTodaysOffers,
  
  async submitPriceContribution(
    contribution: PriceContribution,
    userId: string,
    userName: string
  ): Promise<void> {
    return await supabaseDailyOffersService.submitPriceContribution(
      contribution,
      userId,
      userName
    );
  },

  // Manter validações locais
  validateUserContribution: supabaseDailyOffersService.validateUserContribution,
  validatePriceContribution: validationService.validatePriceContribution,

  // Manter funções de verificação (serão movidas para Supabase futuramente)
  checkIfShouldBeVerified: (contribution: PriceContribution, userId: string, offers: DailyOffer[]) => {
    const similarOffer = offers.find(offer => 
      offer.userId !== userId &&
      validationService.areStringsSimilar(offer.productName, contribution.productName) &&
      validationService.areStringsSimilar(offer.storeName, contribution.storeName) &&
      validationService.normalizeString(offer.city) === validationService.normalizeString(contribution.city)
    );
    return !!similarOffer;
  },

  markSimilarOffersAsVerified: () => {
    // TODO: Implementar no Supabase
    console.log('markSimilarOffersAsVerified - to be implemented in Supabase');
  },

  clearOldOffers: () => {
    // Não necessário com Supabase - será feito por trigger/policy
    console.log('clearOldOffers - handled by Supabase');
  },

  debugGetAllOffers: () => {
    console.log('debugGetAllOffers - use Supabase dashboard for debugging');
    return [];
  }
};
