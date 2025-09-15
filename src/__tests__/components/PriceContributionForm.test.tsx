import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { toast } from 'sonner';
import PriceContributionForm from '@/components/PriceContributionForm';
import { usePriceContributionForm } from '@/hooks/usePriceContributionForm';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  }
}));

vi.mock('@/hooks/usePriceContributionForm', () => ({
  usePriceContributionForm: vi.fn()
}));

vi.mock('@/components/price-contribution/PriceContributionWarning', () => ({
  default: () => <div data-testid="price-contribution-warning">Warning Component</div>
}));

vi.mock('@/components/price-contribution/ProductInfoFields', () => ({
  default: ({ formData, setFormData }: any) => (
    <div data-testid="product-info-fields">
      <input
        data-testid="product-name-input"
        value={formData.productName}
        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
      />
      <input
        data-testid="price-input"
        type="number"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
      />
    </div>
  )
}));

describe('PriceContributionForm', () => {
  const mockOnClose = vi.fn();
  const mockHandleSubmit = vi.fn();
  const mockSetFormData = vi.fn();

  const defaultFormData = {
    productName: '',
    price: 0,
    storeName: '',
    city: '',
    state: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    (usePriceContributionForm as any).mockReturnValue({
      formData: defaultFormData,
      setFormData: mockSetFormData,
      isSubmitting: false,
      locationLoading: false,
      handleSubmit: mockHandleSubmit,
    });
  });

  it('should render the form with all essential elements', () => {
    render(<PriceContributionForm onClose={mockOnClose} />);
    
    expect(screen.getByText('Compartilhar Preço')).toBeInTheDocument();
    expect(screen.getByText('Ajude nossa comunidade com informações de preços atualizadas')).toBeInTheDocument();
    expect(screen.getByTestId('price-contribution-warning')).toBeInTheDocument();
    expect(screen.getByTestId('product-info-fields')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /compartilhar/i })).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<PriceContributionForm onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call handleSubmit when form is submitted', async () => {
    render(<PriceContributionForm onClose={mockOnClose} />);
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it('should disable submit button when submitting', () => {
    (usePriceContributionForm as any).mockReturnValue({
      formData: defaultFormData,
      setFormData: mockSetFormData,
      isSubmitting: true,
      locationLoading: false,
      handleSubmit: mockHandleSubmit,
    });

    render(<PriceContributionForm onClose={mockOnClose} />);
    
    const submitButton = screen.getByRole('button', { name: /enviando/i });
    expect(submitButton).toBeDisabled();
  });

  it('should disable submit button when location is loading', () => {
    (usePriceContributionForm as any).mockReturnValue({
      formData: defaultFormData,
      setFormData: mockSetFormData,
      isSubmitting: false,
      locationLoading: true,
      handleSubmit: mockHandleSubmit,
    });

    render(<PriceContributionForm onClose={mockOnClose} />);
    
    expect(screen.getByText('📍 Detectando sua localização automaticamente...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /compartilhar/i })).toBeDisabled();
  });

  it('should disable submit button when city is not available', () => {
    render(<PriceContributionForm onClose={mockOnClose} />);
    
    expect(screen.getByRole('button', { name: /compartilhar/i })).toBeDisabled();
  });

  it('should enable submit button when city is available and not submitting', () => {
    (usePriceContributionForm as any).mockReturnValue({
      formData: { ...defaultFormData, city: 'São Paulo', state: 'SP' },
      setFormData: mockSetFormData,
      isSubmitting: false,
      locationLoading: false,
      handleSubmit: mockHandleSubmit,
    });

    render(<PriceContributionForm onClose={mockOnClose} />);
    
    expect(screen.getByText('📍 Localização: São Paulo, SP')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /compartilhar/i })).not.toBeDisabled();
  });

  it('should show loading spinner when submitting', () => {
    (usePriceContributionForm as any).mockReturnValue({
      formData: { ...defaultFormData, city: 'São Paulo', state: 'SP' },
      setFormData: mockSetFormData,
      isSubmitting: true,
      locationLoading: false,
      handleSubmit: mockHandleSubmit,
    });

    render(<PriceContributionForm onClose={mockOnClose} />);
    
    expect(screen.getByText(/enviando/i)).toBeInTheDocument();
  });
});