
import { supabaseContributionService } from './supabase/contributionService';

export interface SuggestionData {
  title: string;
  description: string;
  category: 'improvement' | 'feature' | 'bug' | 'other';
}

export const contributionService = {
  submitSuggestion: supabaseContributionService.submitSuggestion,
  getUserSuggestions: supabaseContributionService.getUserSuggestions,
  getAllSuggestions: supabaseContributionService.getAllSuggestions,
  updateSuggestionStatus: supabaseContributionService.updateSuggestionStatus,
};
