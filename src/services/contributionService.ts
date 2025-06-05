
import { supabaseContributionService } from './supabase/contributionService';

export interface SuggestionData {
  title: string;
  description: string;
  category: 'improvement' | 'feature' | 'bug' | 'other';
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

export interface UserFeedback {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
}

export const contributionService = {
  submitSuggestion: supabaseContributionService.submitSuggestion,
  getUserSuggestions: supabaseContributionService.getUserSuggestions,
  getAllSuggestions: supabaseContributionService.getAllSuggestions,
  getAllFeedbacks: supabaseContributionService.getAllSuggestions, // Alias for compatibility
  updateSuggestionStatus: supabaseContributionService.updateSuggestionStatus,
  updateFeedbackStatus: supabaseContributionService.updateSuggestionStatus, // Alias for compatibility
};
