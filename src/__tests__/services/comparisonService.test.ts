import { describe, beforeEach, it, expect, vi } from 'vitest';
import { comparisonService } from '@/services/comparisonService';
import { enhancedComparisonService } from '@/services/enhancedComparisonService';
import { supabaseComparisonService } from '@/services/supabase/comparisonService';
import { analytics } from '@/lib/analytics';

// Mock dependencies
vi.mock('@/services/enhancedComparisonService', () => ({
  enhancedComparisonService: {
    getUserComparisons: vi.fn(),
    saveComparison: vi.fn(),
    deleteComparison: vi.fn(),
    getComparisonCount: vi.fn(),
    canMakeComparison: vi.fn(),
  }
}));

vi.mock('@/services/supabase/comparisonService', () => ({
  supabaseComparisonService: {
    updateComparison: vi.fn(),
  }
}));

vi.mock('@/lib/analytics', () => ({
  analytics: {
    trackComparison: vi.fn(),
    trackError: vi.fn(),
    trackUserAction: vi.fn(),
  }
}));

describe('comparisonService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserComparisons', () => {
    it('should delegate to enhanced service', async () => {
      const userId = 'user123';
      const mockComparisons = [
        { id: '1', userId, products: [], stores: [] },
        { id: '2', userId, products: [], stores: [] }
      ];

      (enhancedComparisonService.getUserComparisons as any).mockResolvedValue(mockComparisons);

      const result = await comparisonService.getUserComparisons(userId);

      expect(enhancedComparisonService.getUserComparisons).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockComparisons);
    });
  });

  describe('saveComparison', () => {
    it('should save comparison and track analytics', async () => {
      const mockComparisonData = {
        userId: 'user123',
        products: [
          { id: '1', name: 'Product 1', prices: {} },
          { id: '2', name: 'Product 2', prices: {} }
        ],
        stores: [
          { id: '1', name: 'Store 1' },
          { id: '2', name: 'Store 2' }
        ]
      };

      const mockResult = { id: 'comparison123', ...mockComparisonData };
      (enhancedComparisonService.saveComparison as any).mockResolvedValue(mockResult);

      const result = await comparisonService.saveComparison(mockComparisonData as any);

      expect(enhancedComparisonService.saveComparison).toHaveBeenCalledWith(mockComparisonData);
      expect(analytics.trackComparison).toHaveBeenCalledWith({
        productsCount: 2,
        storesCount: 2,
        timeMs: expect.any(Number)
      });
      expect(result).toEqual(mockResult);
    });

    it('should track errors when saving fails', async () => {
      const mockComparisonData = {
        userId: 'user123',
        products: [{ id: '1', name: 'Product 1', prices: {} }],
        stores: [{ id: '1', name: 'Store 1' }]
      };
      const mockError = new Error('Save failed');

      (enhancedComparisonService.saveComparison as any).mockRejectedValue(mockError);

      await expect(comparisonService.saveComparison(mockComparisonData as any)).rejects.toThrow('Save failed');

      expect(analytics.trackError).toHaveBeenCalledWith(mockError, {
        context: 'comparison_creation',
        comparisonData: {
          productsCount: 1,
          storesCount: 1
        }
      });
    });

    it('should handle comparison data without products/stores', async () => {
      const mockComparisonData = {
        userId: 'user123'
      };

      const mockResult = { id: 'comparison123', ...mockComparisonData };
      (enhancedComparisonService.saveComparison as any).mockResolvedValue(mockResult);

      const result = await comparisonService.saveComparison(mockComparisonData as any);

      expect(analytics.trackComparison).toHaveBeenCalledWith({
        productsCount: 0,
        storesCount: 0,
        timeMs: expect.any(Number)
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteComparison', () => {
    it('should delegate to enhanced service', async () => {
      const comparisonId = 'comparison123';

      await comparisonService.deleteComparison(comparisonId);

      expect(enhancedComparisonService.deleteComparison).toHaveBeenCalledWith(comparisonId);
    });
  });

  describe('getComparisonCount', () => {
    it('should delegate to enhanced service', async () => {
      const userId = 'user123';
      const mockCount = 5;

      (enhancedComparisonService.getComparisonCount as any).mockResolvedValue(mockCount);

      const result = await comparisonService.getComparisonCount();

      expect(enhancedComparisonService.getComparisonCount).toHaveBeenCalledWith();
      expect(result).toBe(mockCount);
    });
  });

  describe('canMakeComparison', () => {
    it('should delegate to enhanced service', async () => {
      const userPlan = 'premium';
      const monthlyLimit = 10;
      const mockResult = true;

      (enhancedComparisonService.canMakeComparison as any).mockReturnValue(mockResult);

      const result = comparisonService.canMakeComparison(userPlan, monthlyLimit);

      expect(enhancedComparisonService.canMakeComparison).toHaveBeenCalledWith(userPlan, monthlyLimit);
      expect(result).toBe(mockResult);
    });
  });

  describe('updateComparison', () => {
    it('should update comparison via supabase service', async () => {
      const comparisonId = 'comparison123';
      const updateData = { products: [], stores: [] };
      const mockResult = { id: comparisonId, ...updateData };

      (supabaseComparisonService.updateComparison as any).mockResolvedValue(mockResult);

      const result = await comparisonService.updateComparison(comparisonId, updateData);

      expect(supabaseComparisonService.updateComparison).toHaveBeenCalledWith(comparisonId, updateData);
      expect(result).toEqual(mockResult);
    });

    it('should handle update errors', async () => {
      const comparisonId = 'comparison123';
      const updateData = { products: [] };
      const mockError = new Error('Update failed');

      (supabaseComparisonService.updateComparison as any).mockRejectedValue(mockError);

      await expect(comparisonService.updateComparison(comparisonId, updateData)).rejects.toThrow(
        'Failed to update comparison: Error: Update failed'
      );
    });
  });

  describe('exportToPDF', () => {
    it('should track PDF export and return success', async () => {
      const mockComparisonData = {
        products: [
          { id: '1', name: 'Product 1', prices: {} },
          { id: '2', name: 'Product 2', prices: {} }
        ],
        stores: [
          { id: '1', name: 'Store 1' }
        ]
      };

      const result = await comparisonService.exportToPDF(mockComparisonData as any);

      expect(analytics.trackUserAction).toHaveBeenCalledWith('comparison_export_pdf', {
        productsCount: 2,
        storesCount: 1
      });
      expect(result).toEqual({ success: true });
    });

    it('should track errors during PDF export', async () => {
      const mockComparisonData = {
        products: [],
        stores: []
      };
      const mockError = new Error('PDF generation failed');

      // Mock analytics.trackUserAction to throw an error
      (analytics.trackUserAction as any).mockRejectedValue(mockError);

      await expect(comparisonService.exportToPDF(mockComparisonData as any)).rejects.toThrow('PDF generation failed');

      expect(analytics.trackError).toHaveBeenCalledWith(mockError, { context: 'pdf_export' });
    });
  });

  describe('_supabase access', () => {
    it('should provide access to supabase service', () => {
      expect(comparisonService._supabase).toBe(supabaseComparisonService);
    });
  });
});