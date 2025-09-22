import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSubscription, SubscriptionProvider } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/hooks/useAuth');
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));
vi.mock('sonner');

// Mock window.open
Object.defineProperty(window, 'open', {
  writable: true,
  value: vi.fn()
});

describe('useSubscription', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockProfile = { id: 'user-123', plan: 'free' };
  const mockUpdateProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useAuth as any).mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      updateProfile: mockUpdateProfile
    });

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: null
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SubscriptionProvider>{children}</SubscriptionProvider>
  );

  it('should provide initial state correctly', () => {
    const { result } = renderHook(() => useSubscription(), { wrapper });

    expect(result.current.currentPlan).toBe('free');
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.createCheckout).toBe('function');
    expect(typeof result.current.manageSubscription).toBe('function');
    expect(typeof result.current.updateUserPlan).toBe('function');
    expect(typeof result.current.checkSubscription).toBe('function');
  });

  it('should fallback to free plan when profile.plan is null', () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
      profile: { ...mockProfile, plan: null },
      updateProfile: mockUpdateProfile
    });

    const { result } = renderHook(() => useSubscription(), { wrapper });

    expect(result.current.currentPlan).toBe('free');
  });

  describe('checkSubscription', () => {
    it('should check subscription and update plan if different', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { subscription_tier: 'premium' },
        error: null
      });

      const { result } = renderHook(() => useSubscription(), { wrapper });

      await act(async () => {
        await result.current.checkSubscription();
      });

      expect(supabase.functions.invoke).toHaveBeenCalledWith('check-subscription');
      expect(mockUpdateProfile).toHaveBeenCalledWith({ plan: 'premium' });
    });

    it('should not update plan if same as current', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { subscription_tier: 'free' },
        error: null
      });

      const { result } = renderHook(() => useSubscription(), { wrapper });

      await act(async () => {
        await result.current.checkSubscription();
      });

      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'Service error' }
      });

      const { result } = renderHook(() => useSubscription(), { wrapper });

      await act(async () => {
        await result.current.checkSubscription();
      });

      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it('should not check subscription if no user', async () => {
      (useAuth as any).mockReturnValue({
        user: null,
        profile: null,
        updateProfile: mockUpdateProfile
      });

      const { result } = renderHook(() => useSubscription(), { wrapper });

      await act(async () => {
        await result.current.checkSubscription();
      });

      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });
  });

  describe('createCheckout', () => {
    it('should create checkout successfully', async () => {
      const mockUrl = 'https://checkout.stripe.com/test';
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { url: mockUrl },
        error: null
      });

      const { result } = renderHook(() => useSubscription(), { wrapper });

      await act(async () => {
        await result.current.createCheckout('premium');
      });

      expect(supabase.functions.invoke).toHaveBeenCalledWith('create-checkout', {
        body: { planId: 'premium' }
      });
      expect(window.open).toHaveBeenCalledWith(mockUrl, '_blank');
    });

    it('should show error if no user is logged in', async () => {
      (useAuth as any).mockReturnValue({
        user: null,
        profile: null,
        updateProfile: mockUpdateProfile
      });

      const { result } = renderHook(() => useSubscription(), { wrapper });

      await act(async () => {
        await result.current.createCheckout('premium');
      });

      expect(toast.error).toHaveBeenCalledWith('Você precisa estar logado para assinar um plano');
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });

    it('should handle checkout errors', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'Payment failed' }
      });

      const { result } = renderHook(() => useSubscription(), { wrapper });

      await act(async () => {
        await result.current.createCheckout('premium');
      });

      expect(toast.error).toHaveBeenCalledWith('Erro ao criar checkout: Payment failed');
    });

    it('should handle missing checkout URL', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {},
        error: null
      });

      const { result } = renderHook(() => useSubscription(), { wrapper });

      await act(async () => {
        await result.current.createCheckout('premium');
      });

      expect(toast.error).toHaveBeenCalledWith('Nenhuma URL de checkout foi retornada');
    });
  });

  describe('manageSubscription', () => {
    it('should open customer portal successfully', async () => {
      const mockUrl = 'https://billing.stripe.com/portal';
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { url: mockUrl },
        error: null
      });

      const { result } = renderHook(() => useSubscription(), { wrapper });

      await act(async () => {
        await result.current.manageSubscription();
      });

      expect(supabase.functions.invoke).toHaveBeenCalledWith('customer-portal');
      expect(window.open).toHaveBeenCalledWith(mockUrl, '_blank');
    });

    it('should show error if no user is logged in', async () => {
      (useAuth as any).mockReturnValue({
        user: null,
        profile: null,
        updateProfile: mockUpdateProfile
      });

      const { result } = renderHook(() => useSubscription(), { wrapper });

      await act(async () => {
        await result.current.manageSubscription();
      });

      expect(toast.error).toHaveBeenCalledWith('Você precisa estar logado');
    });

    it('should handle portal errors', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'Portal error' }
      });

      const { result } = renderHook(() => useSubscription(), { wrapper });

      await act(async () => {
        await result.current.manageSubscription();
      });

      expect(toast.error).toHaveBeenCalledWith('Erro ao abrir portal de gerenciamento');
    });
  });

  describe('updateUserPlan', () => {
    it('should update user plan successfully', async () => {
      mockUpdateProfile.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useSubscription(), { wrapper });

      await act(async () => {
        await result.current.updateUserPlan('premium');
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith({ plan: 'premium' });
      expect(toast.success).toHaveBeenCalledWith('Seu plano foi atualizado para premium');
    });

    it('should show error when update fails', async () => {
      mockUpdateProfile.mockResolvedValue({ error: 'Update failed' });

      const { result } = renderHook(() => useSubscription(), { wrapper });

      await act(async () => {
        await result.current.updateUserPlan('premium');
      });

      expect(toast.error).toHaveBeenCalledWith('Não foi possível atualizar o plano');
    });
  });

  it('should check subscription on mount when user exists', async () => {
    const checkSubscriptionSpy = vi.fn();
    vi.mocked(supabase.functions.invoke).mockImplementation(checkSubscriptionSpy);

    renderHook(() => useSubscription(), { wrapper });

    await waitFor(() => {
      expect(checkSubscriptionSpy).toHaveBeenCalledWith('check-subscription');
    });
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useSubscription());
    }).toThrow('useSubscription must be used within a SubscriptionProvider');
  });
});