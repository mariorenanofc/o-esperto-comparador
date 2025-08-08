import { DailyOffer, PriceContribution } from "@/lib/types";
import { supabaseDailyOffersService } from "./supabase/dailyOffersService";
import { offlineStorageService, OfflineContribution } from './offlineStorageService';
import { toast } from 'sonner';

export const enhancedDailyOffersService = {
  // Get today's offers (online only)
  async getTodaysOffers(): Promise<DailyOffer[]> {
    if (!navigator.onLine) {
      console.log('Offline mode: returning empty offers array');
      return [];
    }
    
    try {
      return await supabaseDailyOffersService.getTodaysOffers();
    } catch (error) {
      console.error('Failed to get offers:', error);
      return [];
    }
  },
  
  // Submit price contribution (offline-first)
  async submitPriceContribution(
    contribution: PriceContribution,
    userId: string,
    userName: string
  ): Promise<void> {
    if (navigator.onLine) {
      try {
        await supabaseDailyOffersService.submitPriceContribution(
          contribution,
          userId,
          userName
        );
        console.log('Contribution submitted successfully online');
        return;
      } catch (error) {
        console.error('Failed to submit online, saving offline:', error);
      }
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
    console.log('Contribution saved offline successfully');
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
      
      return { isValid: true, message: 'Contribuição será validada quando sincronizada' };
    }
    
    try {
      return await supabaseDailyOffersService.validateUserContribution(contribution, userId);
    } catch (error) {
      console.error('Validation failed:', error);
      return { isValid: true, message: 'Validação offline - será verificada ao sincronizar' };
    }
  },

  // Admin functions (online only)
  async getAllContributions(): Promise<any[]> {
    if (!navigator.onLine) {
      console.log('Admin functionality requires internet connection');
      return [];
    }
    
    return await supabaseDailyOffersService.getAllContributions();
  },

  async approveContribution(contributionId: string): Promise<void> {
    if (!navigator.onLine) {
      console.log('Admin functionality requires internet connection');
      return;
    }
    
    return await supabaseDailyOffersService.approveContribution(contributionId);
  },

  async rejectContribution(contributionId: string): Promise<void> {
    if (!navigator.onLine) {
      console.log('Admin functionality requires internet connection');
      return;
    }
    
    return await supabaseDailyOffersService.rejectContribution(contributionId);
  },
};