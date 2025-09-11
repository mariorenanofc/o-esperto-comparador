import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/hooks/useAuth';
import { mockUser, mockProfile } from '@/test/testUtils';
import React from 'react';

// Mock Supabase client
const mockSupabase = {
  auth: {
    onAuthStateChange: vi.fn(),
    getSession: vi.fn(),
    signInWithOAuth: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: mockProfile, error: null })),
      })),
    })),
    upsert: vi.fn(() => Promise.resolve({ error: null })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

vi.mock('@/lib/analytics', () => ({
  analytics: {
    trackUserAction: vi.fn(),
  },
}));

vi.mock('@/lib/authCleanup', () => ({
  robustSignOut: vi.fn(),
  prepareForSignIn: vi.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    });
  });

  it('should throw error when used outside AuthProvider', async () => {
    let errorMessage = '';
    
    try {
      renderHook(() => useAuth());
    } catch (error) {
      errorMessage = (error as Error).message;
    }
    
    expect(errorMessage).toBe('useAuth must be used within an AuthProvider');
  });

  it('should provide initial auth state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('should handle successful Google sign in', async () => {
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: { url: 'oauth-url' },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    const signInResult = await result.current.signInWithGoogle();
    
    expect(signInResult.error).toBeNull();
    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/',
      },
    });
  });

  it('should handle sign in with custom redirect', async () => {
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: { url: 'oauth-url' },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await result.current.signInWithGoogleWithRedirect('/dashboard');
    
    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/dashboard',
      },
    });
  });

  it('should handle profile updates', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Simulate signed in state
    result.current.user = mockUser;
    
    const updates = { name: 'Updated Name' };
    const updateResult = await result.current.updateProfile(updates);
    
    expect(updateResult.error).toBeNull();
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
  });

  it('should handle profile update without user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    const updates = { name: 'Updated Name' };
    const updateResult = await result.current.updateProfile(updates);
    
    expect(updateResult.error).toBe('No user logged in');
  });

  it('should call updateActivity when user is present', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Simulate signed in state
    result.current.user = mockUser;
    
    result.current.updateActivity();
    
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
  });
});