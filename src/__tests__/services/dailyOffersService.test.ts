import { describe, beforeEach, it, expect, vi } from 'vitest';
import { dailyOffersService } from '@/services/dailyOffersService';
import { enhancedDailyOffersService } from '@/services/enhancedDailyOffersService';
import { supabaseDailyOffersService } from '@/services/supabase/dailyOffersService';
import { validationService } from '@/services/daily-offers/validationService';

// Mock dependencies
vi.mock('@/services/enhancedDailyOffersService', () => ({
  enhancedDailyOffersService: {
    getTodaysOffers: vi.fn(),
    submitPriceContribution: vi.fn(),
    validateUserContribution: vi.fn(),
    getAllContributions: vi.fn(),
    approveContribution: vi.fn(),
    rejectContribution: vi.fn(),
  }
}));

vi.mock('@/services/supabase/dailyOffersService', () => ({
  supabaseDailyOffersService: {
    getTodaysOffers: vi.fn(),
    submitPriceContribution: vi.fn(),
    validateUserContribution: vi.fn(),
  }
}));

vi.mock('@/services/daily-offers/validationService', () => ({
  validationService: {
    validatePriceContribution: vi.fn(),
    areStringsSimilar: vi.fn(),
    normalizeString: vi.fn(),
  }
}));

describe('dailyOffersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTodaysOffers', () => {
    it('should call enhancedDailyOffersService.getTodaysOffers', async () => {
      const mockOffers = [
        { id: '1', productName: 'Product 1', price: 10.99, verified: true }
      ];
      
      (enhancedDailyOffersService.getTodaysOffers as any).mockResolvedValue(mockOffers);

      const result = await dailyOffersService.getTodaysOffers();

      expect(enhancedDailyOffersService.getTodaysOffers).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockOffers);
    });

    it('should handle errors from enhanced service', async () => {
      const mockError = new Error('Service unavailable');
      (enhancedDailyOffersService.getTodaysOffers as any).mockRejectedValue(mockError);

      await expect(dailyOffersService.getTodaysOffers()).rejects.toThrow('Service unavailable');
    });
  });

  describe('submitPriceContribution', () => {
    it('should call enhancedDailyOffersService.submitPriceContribution with correct parameters', async () => {
      const mockContribution = {
        productName: 'Test Product',
        price: 15.99,
        storeName: 'Test Store',
        city: 'São Paulo',
        state: 'SP',
        userId: 'user123',
        timestamp: new Date(),
        verified: false
      };
      const userId = 'user123';
      const userName = 'Test User';

      await dailyOffersService.submitPriceContribution(mockContribution, userId, userName);

      expect(enhancedDailyOffersService.submitPriceContribution).toHaveBeenCalledWith(
        mockContribution, 
        userId, 
        userName
      );
    });
  });

  describe('validateUserContribution', () => {
    it('should call enhancedDailyOffersService.validateUserContribution', async () => {
      const mockContribution = {
        productName: 'Test Product',
        price: 15.99,
        storeName: 'Test Store',
        city: 'São Paulo',
        state: 'SP',
        userId: 'user123',
        timestamp: new Date(),
        verified: false
      };
      const userId = 'user123';
      const mockValidationResult = { isValid: true, message: 'Valid contribution' };

      (enhancedDailyOffersService.validateUserContribution as any).mockResolvedValue(mockValidationResult);

      const result = await dailyOffersService.validateUserContribution(mockContribution, userId);

      expect(enhancedDailyOffersService.validateUserContribution).toHaveBeenCalledWith(
        mockContribution, 
        userId
      );
      expect(result).toEqual(mockValidationResult);
    });
  });

  describe('admin functions', () => {
    it('should call getAllContributions from enhanced service', async () => {
      const mockContributions = [
        { id: '1', productName: 'Product 1', status: 'pending' },
        { id: '2', productName: 'Product 2', status: 'approved' }
      ];

      (enhancedDailyOffersService.getAllContributions as any).mockResolvedValue(mockContributions);

      const result = await dailyOffersService.getAllContributions();

      expect(enhancedDailyOffersService.getAllContributions).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockContributions);
    });

    it('should call approveContribution from enhanced service', async () => {
      const contributionId = 'contribution123';

      await dailyOffersService.approveContribution(contributionId);

      expect(enhancedDailyOffersService.approveContribution).toHaveBeenCalledWith(contributionId);
    });

    it('should call rejectContribution from enhanced service', async () => {
      const contributionId = 'contribution123';

      await dailyOffersService.rejectContribution(contributionId);

      expect(enhancedDailyOffersService.rejectContribution).toHaveBeenCalledWith(contributionId);
    });
  });

  describe('validatePriceContribution', () => {
    it('should call validationService.validatePriceContribution', () => {
      const mockContribution = {
        productName: 'Test Product',
        price: 15.99,
        storeName: 'Test Store',
        city: 'São Paulo',
        state: 'SP',
        userId: 'user123',
        timestamp: new Date(),
        verified: false
      };
      const userId = 'user123';

      dailyOffersService.validatePriceContribution(mockContribution, userId);

      expect(validationService.validatePriceContribution).toHaveBeenCalledWith(mockContribution, userId);
    });
  });

  describe('checkIfShouldBeVerified', () => {
    it('should return true when similar offer exists from different user', () => {
      const contribution = {
        productName: 'Test Product',
        storeName: 'Test Store',
        city: 'São Paulo',
        state: 'SP'
      };
      const userId = 'user1';
      const offers = [
        {
          userId: 'user2',
          productName: 'test product',
          storeName: 'test store',
          city: 'sao paulo'
        }
      ];

      (validationService.areStringsSimilar as any).mockReturnValue(true);
      (validationService.normalizeString as any).mockImplementation((str: string) => str.toLowerCase());

      const result = dailyOffersService.checkIfShouldBeVerified(contribution as any, userId, offers as any);

      expect(result).toBe(true);
    });

    it('should return false when no similar offer exists', () => {
      const contribution = {
        productName: 'Test Product',
        storeName: 'Test Store',
        city: 'São Paulo',
        state: 'SP'
      };
      const userId = 'user1';
      const offers: any[] = [];

      const result = dailyOffersService.checkIfShouldBeVerified(contribution as any, userId, offers as any);

      expect(result).toBe(false);
    });

    it('should return false when similar offer is from same user', () => {
      const contribution = {
        productName: 'Test Product',
        storeName: 'Test Store',
        city: 'São Paulo',
        state: 'SP'
      };
      const userId = 'user1';
      const offers = [
        {
          userId: 'user1', // Same user
          productName: 'test product',
          storeName: 'test store',
          city: 'sao paulo'
        }
      ];

      (validationService.areStringsSimilar as any).mockReturnValue(true);
      (validationService.normalizeString as any).mockImplementation((str) => str.toLowerCase());

      const result = dailyOffersService.checkIfShouldBeVerified(contribution as any, userId, offers as any);

      expect(result).toBe(false);
    });
  });

  describe('legacy functions', () => {
    it('should log message for markSimilarOffersAsVerified', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      dailyOffersService.markSimilarOffersAsVerified();
      
      expect(consoleSpy).toHaveBeenCalledWith('markSimilarOffersAsVerified - handled by admin approval system');
      
      consoleSpy.mockRestore();
    });

    it('should log message and return empty array for debugGetAllOffers', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const result = dailyOffersService.debugGetAllOffers();
      
      expect(consoleSpy).toHaveBeenCalledWith('debugGetAllOffers - use Supabase dashboard for debugging');
      expect(result).toEqual([]);
      
      consoleSpy.mockRestore();
    });
  });

  describe('_supabase access', () => {
    it('should provide access to supabase service', () => {
      expect(dailyOffersService._supabase).toBe(supabaseDailyOffersService);
    });
  });
});