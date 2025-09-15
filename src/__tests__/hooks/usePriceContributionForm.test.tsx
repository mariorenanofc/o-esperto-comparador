import { renderHook, act } from '@testing-library/react';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { usePriceContributionForm } from '@/hooks/usePriceContributionForm';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useRateLimit } from '@/hooks/useRateLimit';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/hooks/useGeolocation', () => ({
  useGeolocation: vi.fn()
}));

vi.mock('@/hooks/useRateLimit', () => ({
  useRateLimit: vi.fn()
}));

vi.mock('@/hooks/price-contribution/useFormValidation', () => ({
  useFormValidation: vi.fn(() => ({
    validateForm: vi.fn(() => ({ isValid: true }))
  }))
}));

vi.mock('@/hooks/price-contribution/useFormState', () => ({
  useFormState: vi.fn(() => ({
    formData: {
      productName: '',
      price: 0,
      storeName: '',
      city: 'São Paulo',
      state: 'SP'
    },
    setFormData: vi.fn(),
    resetForm: vi.fn()
  }))
}));

vi.mock('@/hooks/price-contribution/useFormSubmission', () => ({
  useFormSubmission: vi.fn(() => ({
    isSubmitting: false,
    submitContribution: vi.fn()
  }))
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  }
}));

vi.mock('@/lib/analytics', () => ({
  analytics: {
    trackContribution: vi.fn(),
    trackError: vi.fn()
  }
}));

describe('usePriceContributionForm', () => {
  const mockUser = { id: '1', email: 'test@example.com' };
  const mockProfile = { id: '1', user_id: '1' };
  const mockCheckRateLimit = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useAuth as any).mockReturnValue({
      user: mockUser,
      profile: mockProfile
    });

    (useGeolocation as any).mockReturnValue({
      city: 'São Paulo',
      state: 'SP',
      loading: false
    });

    (useRateLimit as any).mockReturnValue({
      checkRateLimit: mockCheckRateLimit
    });

    mockCheckRateLimit.mockResolvedValue(true);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePriceContributionForm({ onClose: mockOnClose }));

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.locationLoading).toBe(false);
    expect(result.current.formData).toEqual({
      productName: '',
      price: 0,
      storeName: '',
      city: 'São Paulo',
      state: 'SP'
    });
    expect(typeof result.current.handleSubmit).toBe('function');
  });

  it('should handle form submission successfully', async () => {
    const { result } = renderHook(() => usePriceContributionForm({ onClose: mockOnClose }));

    const mockEvent = {
      preventDefault: vi.fn(),
      type: 'submit',
      target: {}
    } as any;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockCheckRateLimit).toHaveBeenCalledWith('price_contribution', {
      maxAttempts: 5,
      windowMinutes: 60,
      blockMinutes: 30
    });
  });

  it('should not submit when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue(false);
    
    const { result } = renderHook(() => usePriceContributionForm({ onClose: mockOnClose }));

    const mockEvent = {
      preventDefault: vi.fn(),
      type: 'submit',
      target: {}
    } as any;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockCheckRateLimit).toHaveBeenCalled();
  });

  it('should handle geolocation loading state', () => {
    (useGeolocation as any).mockReturnValue({
      city: null,
      state: null,
      loading: true
    });

    const { result } = renderHook(() => usePriceContributionForm({ onClose: mockOnClose }));

    expect(result.current.locationLoading).toBe(true);
  });

  it('should provide form data and setter', () => {
    const { result } = renderHook(() => usePriceContributionForm({ onClose: mockOnClose }));

    expect(result.current.formData).toBeDefined();
    expect(typeof result.current.setFormData).toBe('function');
  });
});