import { supabase } from "@/integrations/supabase/client";
import { maskSensitiveData } from "@/lib/security";

/**
 * Secure admin utilities with proper authorization checks and data masking
 */
export class SecureAdmin {
  /**
   * Verify current user has admin privileges
   */
  static async verifyAdminAccess(): Promise<boolean> {
    try {
      const { data: isAdmin, error } = await supabase.rpc('check_admin_with_auth');
      if (error) {
        console.error('Admin verification failed:', error);
        return false;
      }
      return !!isAdmin;
    } catch (error) {
      console.error('Admin verification error:', error);
      return false;
    }
  }

  /**
   * Get masked user data for admin viewing
   */
  static async getMaskedUserData(users: any[]): Promise<any[]> {
    const hasAccess = await this.verifyAdminAccess();
    if (!hasAccess) {
      throw new Error('Unauthorized: Admin access required');
    }

    return users.map(user => ({
      ...user,
      email: this.maskEmail(user.email),
      // Remove sensitive fields from client view
      comparisons_made_this_month: '***',
      last_comparison_reset_month: '***'
    }));
  }

  /**
   * Mask email addresses for display
   */
  static maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '***';
    
    const [username, domain] = email.split('@');
    const maskedUsername = username.length > 3 
      ? username.substring(0, 3) + '***' 
      : '***';
    
    return `${maskedUsername}@${domain}`;
  }

  /**
   * Log admin actions securely
   */
  static async logAction(action: string, targetUserId?: string, details?: any): Promise<void> {
    try {
      const hasAccess = await this.verifyAdminAccess();
      if (!hasAccess) return;

      await supabase.rpc('log_admin_action', {
        action_type: action,
        target_user: targetUserId || null,
        action_details: maskSensitiveData(details) || null
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }

  /**
   * Secure function call with admin verification
   */
  static async secureAdminCall<T>(
    operation: () => Promise<T>,
    actionName: string,
    targetUserId?: string
  ): Promise<T> {
    const hasAccess = await this.verifyAdminAccess();
    if (!hasAccess) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const result = await operation();
      await this.logAction(actionName, targetUserId);
      return result;
    } catch (error) {
      console.error(`Secure admin call failed for ${actionName}:`, error);
      throw error;
    }
  }
}