import { DailyOffer, PriceContribution } from "@/lib/types";
import { supabaseDailyOffersService } from "./supabase/dailyOffersService";
import { offlineStorageService, OfflineContribution } from './offlineStorageService';
import { logger } from "@/lib/logger";
import { errorHandler } from "@/lib/errorHandler";

export const enhancedDailyOffersService = {
  // Get today's offers (online only)
  async getTodaysOffers(): Promise<DailyOffer[]> {
    if (!navigator.onLine) {
      logger.info('Offline mode: returning empty offers array');
      return [];
    }
    
    return errorHandler.retry(
      async () => {
        return await supabaseDailyOffersService.getTodaysOffers();
      },
      2,
      1000,
      { component: 'enhancedDailyOffersService', action: 'buscar ofertas do dia' }
    ) || [];
  },
  
  // Submit price contribution (offline-first)
  async submitPriceContribution(
    contribution: PriceContribution,
    userId: string,
    userName: string
  ): Promise<void> {
    if (navigator.onLine) {
      const result = await errorHandler.handleAsync(
        async () => {
          await supabaseDailyOffersService.submitPriceContribution(
            contribution,
            userId,
            userName
          );
          logger.info('Contribution submitted successfully online', { userId });
        },
        { component: 'enhancedDailyOffersService', action: 'enviar contribuição online', userId },
        { severity: 'high', showToast: true }
      );
      
      if (result !== null) return;
      
      logger.warn('Failed to submit online, saving offline', { userId });
    }
    
    // Save offline
    const offlineContribution: OfflineContribution = {
      id: `offline_contrib_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      productName: contribution.productName,
      price: contribution.price,
      storeName: contribution.storeName,
      city: contribution.city,
      state: contribution.state,
      quantity: contribution.quantity || 1,
      unit: contribution.unit || 'unidade',
      timestamp: Date.now(),
      synced: false,
    };
    
    offlineStorageService.saveOfflineContribution(offlineContribution);
    logger.info('Contribution saved offline successfully', { userId });
  },

  // Validate user contribution
  async validateUserContribution(contribution: PriceContribution, userId: string) {
    if (!navigator.onLine) {
      // Basic offline validation
      if (!contribution.productName?.trim() || !contribution.storeName?.trim()) {
        return { isValid: false, message: 'Nome do produto e loja são obrigatórios' };
      }
      
      if (contribution.price <= 0) {
        return { isValid: false, message: 'Preço deve ser maior que zero' };
      }
      
      logger.info('Offline validation passed', { userId });
      return { isValid: true, message: 'Contribuição será validada quando sincronizada' };
    }
    
    return errorHandler.handleAsync(
      async () => {
        return await supabaseDailyOffersService.validateUserContribution(contribution, userId);
      },
      { component: 'enhancedDailyOffersService', action: 'validar contribuição', userId },
      { severity: 'medium', showToast: false }
    ) || { isValid: true, message: 'Validação offline - será verificada ao sincronizar' };
  },

  // Admin functions (online only)
  async getAllContributions(): Promise<any[]> {
    if (!navigator.onLine) {
      logger.warn('Admin functionality requires internet connection');
      return [];
    }
    
    return await supabaseDailyOffersService.getAllContributions();
  },

  async approveContribution(contributionId: string): Promise<void> {
    if (!navigator.onLine) {
      logger.warn('Admin functionality requires internet connection');
      return;
    }
    
    return await supabaseDailyOffersService.approveContribution(contributionId);
  },

  async rejectContribution(contributionId: string): Promise<void> {
    if (!navigator.onLine) {
      logger.warn('Admin functionality requires internet connection');
      return;
    }
    
    return await supabaseDailyOffersService.rejectContribution(contributionId);
  },
};