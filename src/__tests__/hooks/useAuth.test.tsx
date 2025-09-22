import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { analytics } from '@/lib/analytics';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  analytics: {
    trackUserAction: vi.fn(),
  },
}));

// Mock auth cleanup
vi.mock('@/lib/authCleanup', () => ({
  robustSignOut: vi.fn(),
  prepareForSignIn: vi.fn(),
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    origin: 'http://localhost:3000',
    href: 'http://localhost:3000'
  }
});

describe('useAuth', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      name: 'Test User',
      full_name: 'Test User Full'
    },
  };

  const mockSession = {
    user: mockUser,
    access_token: 'test-token',
  };

  const mockProfile = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    plan: 'free',
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
    last_activity: '2023-01-01',
    is_online: true,
    comparisons_made_this_month: 0,
    last_comparison_reset_month: 1
  };

  const mockSupabaseFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockUpsert = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup Supabase auth mock for analytics
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: null },
      error: null
    });
    
    // Setup Supabase mock chain
    (supabase.from as any).mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      upsert: mockUpsert,
      eq: mockEq,
      single: mockSingle
    });

    mockSelect.mockReturnValue({
      eq: mockEq,
      single: mockSingle
    });

    mockUpdate.mockReturnValue({
      eq: mockEq
    });

    mockUpsert.mockReturnValue({
      data: null,
      error: null
    });

    mockEq.mockReturnValue({
      single: mockSingle,
      data: null,
      error: null
    });

    mockSingle.mockResolvedValue({
      data: mockProfile,
      error: null
    });
    
    // Mock successful auth state change subscription
    (supabase.auth.onAuthStateChange as any).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    
    // Mock initial session as null
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: null },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('should provide initial auth state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  describe('signInWithGoogle', () => {
    it('should sign in with Google successfully', async () => {
      (supabase.auth.signInWithOAuth as any).mockResolvedValue({
        data: { url: 'https://oauth.url' },
        error: null
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signInWithGoogle();
      });

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/'
        }
      });
      expect(analytics.trackUserAction).toHaveBeenCalledWith('login', {
        loginMethod: 'google_oauth',
        redirectPath: '/'
      });
      expect(signInResult).toEqual({ error: null });
    });

    it('should handle sign in errors', async () => {
      const mockError = { message: 'OAuth failed' };
      (supabase.auth.signInWithOAuth as any).mockResolvedValue({
        data: null,
        error: mockError
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signInWithGoogle();
      });

      expect(signInResult).toEqual({ error: mockError });
    });
  });

  describe('signInWithGoogleWithRedirect', () => {
    it('should sign in with custom redirect path', async () => {
      (supabase.auth.signInWithOAuth as any).mockResolvedValue({
        data: { url: 'https://oauth.url' },
        error: null
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signInWithGoogleWithRedirect('/dashboard');
      });

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/dashboard'
        }
      });
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const mockRobustSignOut = vi.fn().mockResolvedValue(undefined);
      vi.doMock('@/lib/authCleanup', () => ({
        robustSignOut: mockRobustSignOut
      }));

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession }
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signOut();
      });

      expect(analytics.trackUserAction).toHaveBeenCalledWith('logout');
      // Note: Verify database update call structure
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should handle sign out errors gracefully', async () => {
      const mockRobustSignOut = vi.fn().mockRejectedValue(new Error('Sign out failed'));
      vi.doMock('@/lib/authCleanup', () => ({
        robustSignOut: mockRobustSignOut
      }));

      // Mock window.location.href
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: '' }
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signOut();
      });

      expect(window.location.href).toBe('/');
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession }
      });

      mockEq.mockResolvedValue({
        data: null,
        error: null
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial auth state to be set
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updates = { name: 'Updated Name' };
      let updateResult;
      
      await act(async () => {
        updateResult = await result.current.updateProfile(updates);
      });

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(updateResult).toEqual({ error: null });
    });

    it('should return error when no user is logged in', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateProfile({ name: 'Test' });
      });

      expect(updateResult).toEqual({ error: 'No user logged in' });
    });

    it('should handle update errors', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession }
      });

      const mockError = { message: 'Update failed' };
      mockEq.mockResolvedValue({
        data: null,
        error: mockError
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial auth state to be set
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateProfile({ name: 'Test' });
      });

      expect(updateResult).toEqual({ error: mockError });
    });
  });

  describe('updateActivity', () => {
    it('should update user activity when user is logged in', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession }
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        result.current.updateActivity();
      });

      // Verify the database call structure 
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });
  });

  describe('auth state changes', () => {
    it('should handle SIGNED_IN event', async () => {
      let authStateCallback: any;
      (supabase.auth.onAuthStateChange as any).mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        authStateCallback('SIGNED_IN', mockSession);
      });

      // Verify that updateActivity and fetchProfile would be called
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should handle SIGNED_OUT event', async () => {
      let authStateCallback: any;
      (supabase.auth.onAuthStateChange as any).mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        authStateCallback('SIGNED_OUT', null);
      });

      expect(result.current.profile).toBeNull();
    });
  });
});