
import { PriceContribution, DailyOffer, PriceValidationResult } from '@/lib/types';
import { contributionService } from './daily-offers/contributionService';
import { validationService } from './daily-offers/validationService';
import { fetchService } from './daily-offers/fetchService';
import { adminService } from './daily-offers/adminService';

export const supabaseDailyOffersService = {
  async submitPriceContribution(contribution: PriceContribution, userId: string, contributorName: string): Promise<void> {
    return contributionService.submitPriceContribution(contribution, userId, contributorName);
  },

  async validateUserContribution(contribution: PriceContribution, userId: string): Promise<PriceValidationResult> {
    return validationService.validateUserContribution(contribution, userId);
  },

  async getTodaysOffers(): Promise<DailyOffer[]> {
    return fetchService.getTodaysOffers();
  },

  async getAllContributions(): Promise<any[]> {
    return fetchService.getAllContributions();
  },

  async approveContribution(contributionId: string): Promise<void> {
    return adminService.approveContribution(contributionId);
  },

  async rejectContribution(contributionId: string): Promise<void> {
    return adminService.rejectContribution(contributionId);
  }
};
