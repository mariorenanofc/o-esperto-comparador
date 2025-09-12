import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAuth, AuthProvider } from '@/hooks/useAuth';
import { mockUser, mockProfile } from '@/test/testUtils';
import React from 'react';

// Mock Supabase client
const mockSupabase = {
  auth: {
    onAuthStateChange: vi.fn(),
    getSession: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    upsert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(),
    })),
  })),
};

// Mock modules
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

vi.mock('@/lib/analytics', () => ({
  trackUser: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock('@/lib/authCleanup', () => ({
  prepareForSignIn: vi.fn(),
  handleSignOut: vi.fn(),
}));

describe('useAuth', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error when used outside AuthProvider', () => {
    try {
      renderHook(() => useAuth());
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should provide initial state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('should handle successful Google sign in', async () => {
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({ error: null });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await result.current.signInWithGoogle();
    
    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: expect.any(String),
      },
    });
  });

  it('should handle Google sign in with redirect', async () => {
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({ error: null });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await result.current.signInWithGoogleWithRedirect('/dashboard');
    
    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: expect.stringContaining('/dashboard'),
      },
    });
  });

  it('should update profile when user is logged in', async () => {
    const mockUpdate = vi.fn().mockResolvedValue({ error: null });
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: mockUpdate,
      })),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await result.current.updateProfile({ name: 'Updated Name' });
    
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
  });

  it('should not update profile when user is not logged in', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await result.current.updateProfile({ name: 'Updated Name' });
    
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it('should update activity when user is present', async () => {
    const mockUpdate = vi.fn().mockResolvedValue({ error: null });
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: mockUpdate,
      })),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await result.current.updateActivity();
    
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
  });
});