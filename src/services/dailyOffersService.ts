
import { DailyOffer, PriceContribution } from "@/lib/types";
import { supabaseDailyOffersService } from "./supabase/dailyOffersService";
import { validationService } from "./daily-offers/validationService";

export const dailyOffersService = {
  // Usar serviços do Supabase com limpeza automática
  async getTodaysOffers(): Promise<DailyOffer[]> {
    console.log('Getting today\'s offers with automatic cleanup...');
    return await supabaseDailyOffersService.getTodaysOffers();
  },
  
  async submitPriceContribution(
    contribution: PriceContribution,
    userId: string,
    userName: string
  ): Promise<void> {
    console.log('Submitting price contribution with 24h validation...');
    return await supabaseDailyOffersService.submitPriceContribution(
      contribution,
      userId,
      userName
    );
  },

  // Manter validações locais
  validateUserContribution: supabaseDailyOffersService.validateUserContribution,
  validatePriceContribution: validationService.validatePriceContribution,

  // Funções de admin
  async getAllContributions(): Promise<any[]> {
    return await supabaseDailyOffersService.getAllContributions();
  },

  async approveContribution(contributionId: string): Promise<void> {
    return await supabaseDailyOffersService.approveContribution(contributionId);
  },

  async rejectContribution(contributionId: string): Promise<void> {
    return await supabaseDailyOffersService.rejectContribution(contributionId);
  },

  // Função de limpeza manual
  async cleanupOldOffers(): Promise<void> {
    console.log('Manual cleanup requested - handled by database trigger');
    // A limpeza agora é feita automaticamente pelo trigger do banco
  },

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
