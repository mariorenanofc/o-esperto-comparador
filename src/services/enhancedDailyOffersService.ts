import { DailyOffer, PriceContribution } from "@/lib/types";
import { supabaseDailyOffersService } from "./supabase/dailyOffersService";
import { offlineStorageService, OfflineContribution } from './offlineStorageService';
import { toast } from 'sonner';

export const enhancedDailyOffersService = {
  // Get today's offers (online only)
  async getTodaysOffers(): Promise<DailyOffer[]> {
    const isOnline = navigator.onLine;
    
    if (!isOnline) {
      toast.info('Ofertas não disponíveis offline. Conecte-se à internet.');
      return [];
    }
    
    try {
      return await supabaseDailyOffersService.getTodaysOffers();
    } catch (error) {
      console.error('Failed to get offers:', error);
      toast.error('Falha ao carregar ofertas. Verifique sua conexão.');
      return [];
    }
  },
  
  // Submit price contribution (offline-first)
  async submitPriceContribution(
    contribution: PriceContribution,
    userId: string,
    userName: string
  ): Promise<void> {
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      try {
        await supabaseDailyOffersService.submitPriceContribution(
          contribution,
          userId,
          userName
        );
        toast.success('Contribuição enviada com sucesso!');
        return;
      } catch (error) {
        console.error('Failed to submit online, saving offline:', error);
        toast.warning('Conexão instável. Salvando contribuição offline...');
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
    
    if (!isOnline) {
      toast.success('Contribuição salva offline. Será enviada quando voltar online.');
    } else {
      toast.success('Contribuição salva offline devido a problema de conexão.');
    }
  },

  // Validate user contribution
  async validateUserContribution(contribution: PriceContribution, userId: string) {
    const isOnline = navigator.onLine;
    
    if (!isOnline) {
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
    const isOnline = navigator.onLine;
    
    if (!isOnline) {
      toast.error('Funcionalidade de admin requer conexão com internet');
      return [];
    }
    
    return await supabaseDailyOffersService.getAllContributions();
  },

  async approveContribution(contributionId: string): Promise<void> {
    const isOnline = navigator.onLine;
    
    if (!isOnline) {
      toast.error('Funcionalidade de admin requer conexão com internet');
      return;
    }
    
    return await supabaseDailyOffersService.approveContribution(contributionId);
  },

  async rejectContribution(contributionId: string): Promise<void> {
    const isOnline = navigator.onLine;
    
    if (!isOnline) {
      toast.error('Funcionalidade de admin requer conexão com internet');
      return;
    }
    
    return await supabaseDailyOffersService.rejectContribution(contributionId);
  },
};