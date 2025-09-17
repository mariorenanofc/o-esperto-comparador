import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contributionService, SuggestionData } from '@/services/contributionService';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    functions: {
      invoke: vi.fn()
    }
  }
}));

// Mock supabaseContributionService
vi.mock('@/services/supabase/contributionService', () => ({
  supabaseContributionService: {
    getUserSuggestions: vi.fn()
  }
}));

describe('contributionService', () => {
  const mockSupabaseFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockOrder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup Supabase mock chain
    (supabase.from as any).mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      eq: mockEq,
      single: mockSingle,
      order: mockOrder
    });

    mockSelect.mockReturnValue({
      eq: mockEq,
      single: mockSingle,
      order: mockOrder
    });

    mockInsert.mockReturnValue({
      select: mockSelect,
      single: mockSingle
    });

    mockUpdate.mockReturnValue({
      eq: mockEq
    });

    mockEq.mockReturnValue({
      single: mockSingle,
      order: mockOrder
    });

    mockOrder.mockReturnValue({
      data: [],
      error: null
    });
  });

  describe('submitSuggestion', () => {
    const mockUserId = 'user-123';
    const mockSuggestionData: SuggestionData = {
      title: 'Test Suggestion',
      description: 'Test Description',
      category: 'improvement',
      userName: 'Test User',
      userEmail: 'test@example.com'
    };

    it('should submit suggestion successfully when profile exists', async () => {
      const mockSuggestion = { id: 'suggestion-123', ...mockSuggestionData };

      // Mock profile exists
      mockSingle.mockResolvedValueOnce({
        data: { id: mockUserId, name: 'Test User' },
        error: null
      });

      // Mock suggestion insert
      mockSingle.mockResolvedValueOnce({
        data: mockSuggestion,
        error: null
      });

      const result = await contributionService.submitSuggestion(mockUserId, mockSuggestionData);

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.from).toHaveBeenCalledWith('suggestions');
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: mockUserId,
        title: mockSuggestionData.title,
        description: mockSuggestionData.description,
        category: mockSuggestionData.category,
        status: 'open'
      });
      expect(result).toEqual(mockSuggestion);
    });

    it('should create profile when it does not exist', async () => {
      const mockSuggestion = { id: 'suggestion-123', ...mockSuggestionData };

      // Mock profile does not exist
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });

      // Mock profile creation
      mockInsert.mockResolvedValueOnce({
        data: null,
        error: null
      });

      // Mock suggestion insert
      mockSingle.mockResolvedValueOnce({
        data: mockSuggestion,
        error: null
      });

      const result = await contributionService.submitSuggestion(mockUserId, mockSuggestionData);

      expect(mockInsert).toHaveBeenCalledWith({
        id: mockUserId,
        name: mockSuggestionData.userName,
        email: mockSuggestionData.userEmail,
        plan: 'free'
      });
      expect(result).toEqual(mockSuggestion);
    });

    it('should throw error when suggestion submission fails', async () => {
      // Mock profile exists
      mockSingle.mockResolvedValueOnce({
        data: { id: mockUserId },
        error: null
      });

      // Mock suggestion insert fails
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      });

      await expect(contributionService.submitSuggestion(mockUserId, mockSuggestionData))
        .rejects.toThrow('Erro ao enviar sugestão');
    });
  });

  describe('getAllFeedbacks', () => {
    it('should fetch all feedbacks successfully', async () => {
      const mockFeedbacks = [
        {
          id: 'feedback-1',
          user_id: 'user-1',
          title: 'Test Feedback',
          description: 'Test Description',
          category: 'improvement',
          status: 'open',
          created_at: '2023-01-01',
          profiles: {
            name: 'Test User',
            email: 'test@example.com'
          }
        }
      ];

      mockOrder.mockResolvedValueOnce({
        data: mockFeedbacks,
        error: null
      });

      const result = await contributionService.getAllFeedbacks();

      expect(supabase.from).toHaveBeenCalledWith('suggestions');
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('profiles'));
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ...mockFeedbacks[0],
        user_name: 'Test User',
        user_email: 'test@example.com',
        user_phone: undefined
      });
    });

    it('should handle empty feedbacks list', async () => {
      mockOrder.mockResolvedValueOnce({
        data: null,
        error: null
      });

      const result = await contributionService.getAllFeedbacks();

      expect(result).toEqual([]);
    });

    it('should throw error when fetch fails', async () => {
      mockOrder.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      });

      await expect(contributionService.getAllFeedbacks())
        .rejects.toThrow();
    });
  });

  describe('updateFeedbackStatus', () => {
    it('should update feedback status successfully', async () => {
      mockEq.mockResolvedValueOnce({
        data: null,
        error: null
      });

      await contributionService.updateFeedbackStatus('feedback-123', 'in-review');

      expect(supabase.from).toHaveBeenCalledWith('suggestions');
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'in-review' });
      expect(mockEq).toHaveBeenCalledWith('id', 'feedback-123');
    });

    it('should throw error when update fails', async () => {
      mockEq.mockResolvedValueOnce({
        data: null,
        error: { message: 'Update failed' }
      });

      await expect(contributionService.updateFeedbackStatus('feedback-123', 'implemented'))
        .rejects.toThrow('Erro ao atualizar status do feedback');
    });
  });

  describe('getUserSuggestions', () => {
    it('should delegate to supabaseContributionService', async () => {
      const mockUserId = 'user-123';
      const mockSuggestions = [{ id: 'suggestion-1', title: 'Test' }];
      
      const { supabaseContributionService } = await import('@/services/supabase/contributionService');
      (supabaseContributionService.getUserSuggestions as any).mockResolvedValue(mockSuggestions);

      const result = await contributionService.getUserSuggestions(mockUserId);

      expect(supabaseContributionService.getUserSuggestions).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockSuggestions);
    });
  });
});