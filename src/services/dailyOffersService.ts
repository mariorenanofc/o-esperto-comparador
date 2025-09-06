
import { DailyOffer, PriceContribution } from "@/lib/types";
import { enhancedDailyOffersService } from "./enhancedDailyOffersService";
import { supabaseDailyOffersService } from "./supabase/dailyOffersService";
import { validationService } from "./daily-offers/validationService";

export const dailyOffersService = {
  // Use enhanced service for offline-first functionality
  getTodaysOffers: enhancedDailyOffersService.getTodaysOffers,
  submitPriceContribution: enhancedDailyOffersService.submitPriceContribution,
  validateUserContribution: enhancedDailyOffersService.validateUserContribution,

  // Admin functions (online only)
  getAllContributions: enhancedDailyOffersService.getAllContributions,
  approveContribution: enhancedDailyOffersService.approveContribution,
  rejectContribution: enhancedDailyOffersService.rejectContribution,

  // Keep original supabase service for direct access if needed
  _supabase: supabaseDailyOffersService,

  // Manter validações locais
  validatePriceContribution: validationService.validatePriceContribution,

  // Manter função de verificação para compatibilidade
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
    console.log('markSimilarOffersAsVerified - handled by admin approval system');
  },

  debugGetAllOffers: () => {
    console.log('debugGetAllOffers - use Supabase dashboard for debugging');
    return [];
  }
};
