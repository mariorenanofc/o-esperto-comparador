
import { DailyOffer, PriceContribution } from "@/lib/types";
import { validationService } from "./validationService";
import { offerStorageService } from "./offerStorageService";

export const offerVerificationService = {
  // Verificar se deve marcar como verificado
  checkIfShouldBeVerified(
    newContribution: PriceContribution,
    userId: string,
    existingOffers: DailyOffer[]
  ): boolean {
    // Procurar por ofertas similares de outros usuários
    const similarOfferFromOtherUser = existingOffers.find(offer => 
      offer.userId !== userId && // Deve ser de outro usuário
      validationService.areStringsSimilar(offer.productName, newContribution.productName) &&
      validationService.areStringsSimilar(offer.storeName, newContribution.storeName) &&
      validationService.normalizeString(offer.city) === validationService.normalizeString(newContribution.city)
    );

    return !!similarOfferFromOtherUser;
  },

  // Marcar ofertas similares como verificadas
  markSimilarOffersAsVerified(
    newContribution: PriceContribution,
    userId: string
  ): void {
    offerStorageService.updateOffers((offers) => {
      offers.forEach(offer => {
        if (
          offer.userId !== userId && // Não marcar ofertas do mesmo usuário
          validationService.areStringsSimilar(offer.productName, newContribution.productName) &&
          validationService.areStringsSimilar(offer.storeName, newContribution.storeName) &&
          validationService.normalizeString(offer.city) === validationService.normalizeString(newContribution.city)
        ) {
          offer.verified = true;
          console.log('Marked offer as verified:', offer.id);
        }
      });
    });
  }
};
