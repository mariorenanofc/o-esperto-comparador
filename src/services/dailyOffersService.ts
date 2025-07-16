// src/services/dailyOffersService.ts
import { DailyOffer, PriceContribution, PriceValidationResult } from "@/lib/types";
// Importa diretamente os serviços de baixo nível ou agrupadores específicos
import { fetchService } from "./supabase/daily-offers/fetchService";
import { contributionService as supabaseContributionService } from "./supabase/daily-offers/contributionService";
import { validationService as localValidationService } from "./daily-offers/validationService"; // Note o alias para evitar conflito de nome se houver outro 'validationService'
import { adminService } from "./supabase/daily-offers/adminService";
import { offerVerificationService } from "./daily-offers/offerVerificationService";


export const dailyOffersService = {
  // Funções de Leitura (Fetch)
  async getTodaysOffers(): Promise<DailyOffer[]> {
    console.log('Getting today\'s offers from fetchService...');
    // Chama o serviço responsável por buscar dados
    return await fetchService.getTodaysOffers();
  },
  
  // Funções de Escrita/Submissão (Contribution)
  async submitPriceContribution(
    contribution: PriceContribution,
    userId: string,
    userName: string
  ): Promise<void> {
    console.log('Submitting price contribution via supabaseContributionService...');
    // Chama o serviço responsável por submeter contribuições
    return await supabaseContributionService.submitPriceContribution(
      contribution,
      userId,
      userName
    );
  },

  // Funções de Validação (Validation)
  // Essas são lógicas que podem ser executadas no frontend ou backend
  validateUserContribution(
    newContribution: PriceContribution,
    userId: string,
    existingOffers: DailyOffer[] // Passar as ofertas existentes como parâmetro
  ): PriceValidationResult {
    console.log('Validating user contribution locally...');
    return localValidationService.validateUserContribution(newContribution, userId, existingOffers);
  },

  validatePriceContribution(
    newContribution: PriceContribution,
    existingOffers: DailyOffer[] // Passar as ofertas existentes como parâmetro
  ): PriceValidationResult {
    console.log('Validating price contribution locally...');
    return localValidationService.validatePriceContribution(newContribution, existingOffers);
  },

  // Funções de Admin
  async getAllContributions(): Promise<any[]> {
    console.log('Getting all contributions for admin from fetchService...');
    // Admin usa a mesma função de busca, mas sem o filtro de 'verified'
    return await fetchService.getAllContributions();
  },

  async approveContribution(contributionId: string): Promise<void> {
    console.log('Approving contribution via adminService...');
    // Chama o serviço de admin para aprovação
    return await adminService.approveContribution(contributionId);
  },

  async rejectContribution(contributionId: string): Promise<void> {
    console.log('Rejecting contribution via adminService...');
    // Chama o serviço de admin para rejeição
    return await adminService.rejectContribution(contributionId);
  },

  // Funções de Verificação (Ofertas)
  checkIfShouldBeVerified: offerVerificationService.checkIfShouldBeVerified,
  markSimilarOffersAsVerified: offerVerificationService.markSimilarOffersAsVerified,

  // Outras funções de utilidade
  async cleanupOldOffers(): Promise<void> {
    console.log('Manual cleanup requested - delegating to fetchService cleanup.');
    // A limpeza agora pode ser diretamente chamada do fetchService
    await fetchService.cleanupOldOffers();
  },

  debugGetAllOffers: fetchService.debugGetAllOffers // Para debug, pode expor
};
