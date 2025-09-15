import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { toast } from 'sonner';
import ComparisonForm from '@/components/ComparisonForm';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useCategories } from '@/hooks/useCategories';
import { useGeolocation } from '@/hooks/useGeolocation';
import { comparisonService } from '@/services/comparisonService';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  }
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: vi.fn()
}));

vi.mock('@/hooks/useCategories', () => ({
  useCategories: vi.fn()
}));

vi.mock('@/hooks/useGeolocation', () => ({
  useGeolocation: vi.fn()
}));

vi.mock('@/hooks/useProductFilters', () => ({
  useProductFilters: vi.fn(() => ({
    filters: {},
    filteredProducts: [],
    availableCategories: [],
    setSearch: vi.fn(),
    setCategory: vi.fn(),
    setSorting: vi.fn(),
    clearFilters: vi.fn(),
    filterStats: {}
  })),
  useSearchHistory: vi.fn(() => ({
    searchHistory: []
  }))
}));

vi.mock('@/hooks/useProductSearch', () => ({
  useProductSearch: vi.fn()
}));

vi.mock('@/services/comparisonService', () => ({
  comparisonService: {
    saveComparison: vi.fn(),
    getUserComparisons: vi.fn()
  }
}));

vi.mock('@/services/supabase/adminService', () => ({
  supabaseAdminService: {
    incrementComparisonsMade: vi.fn()
  }
}));

vi.mock('@/lib/plans', () => ({
  getPlanById: vi.fn(() => ({
    name: 'Free',
    limitations: {
      maxProductsPerComparison: 4,
      maxStoresPerComparison: 2,
      comparisonsPerMonth: 5,
      savedComparisons: 1
    }
  })),
  canUseFeature: vi.fn(() => true)
}));

// Mock sub-components
vi.mock('@/components/ProductModal', () => ({
  default: ({ isOpen, onClose, onSave }: any) => 
    isOpen ? (
      <div data-testid="product-modal">
        <button onClick={() => onSave({ name: 'Test Product', quantity: 1, unit: 'kg', prices: {} })}>
          Save Product
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
}));

vi.mock('@/components/PriceTable', () => ({
  default: () => <div data-testid="price-table">Price Table</div>
}));

vi.mock('@/components/BestPricesByStore', () => ({
  default: () => <div data-testid="best-prices">Best Prices</div>
}));

vi.mock('@/components/comparison/LoadComparisonDrawer', () => ({
  default: ({ isOpen }: any) => 
    isOpen ? <div data-testid="load-drawer">Load Drawer</div> : null
}));

describe('ComparisonForm', () => {
  const mockUser = { id: 'user123', email: 'test@example.com' };
  const mockProfile = { id: 'profile123', comparisons_made_this_month: 0 };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true
    });

    (useAuth as any).mockReturnValue({
      user: mockUser,
      profile: mockProfile
    });

    (useSubscription as any).mockReturnValue({
      currentPlan: 'free'
    });

    (useCategories as any).mockReturnValue({
      categories: [
        { id: '1', name: 'Laticínios' },
        { id: '2', name: 'Carnes' }
      ]
    });

    (useGeolocation as any).mockReturnValue({
      city: 'São Paulo',
      state: 'SP',
      loading: false
    });
  });

  it('should render the comparison form', () => {
    render(<ComparisonForm />);
    
    expect(screen.getByText(/comparação de preços/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adicionar produto/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adicionar mercado/i })).toBeInTheDocument();
  });

  it('should allow adding a store', () => {
    render(<ComparisonForm />);
    
    const storeInput = screen.getByPlaceholderText(/nome do mercado/i);
    const addStoreButton = screen.getByRole('button', { name: /adicionar mercado/i });
    
    fireEvent.change(storeInput, { target: { value: 'Extra' } });
    fireEvent.click(addStoreButton);
    
    expect(toast.success).toHaveBeenCalledWith('Mercado "Extra" adicionado com sucesso!');
  });

  it('should prevent adding empty store name', () => {
    render(<ComparisonForm />);
    
    const addStoreButton = screen.getByRole('button', { name: /adicionar mercado/i });
    fireEvent.click(addStoreButton);
    
    expect(toast.error).toHaveBeenCalledWith('O nome do mercado não pode estar vazio');
  });

  it('should prevent adding duplicate stores', () => {
    render(<ComparisonForm />);
    
    const storeInput = screen.getByPlaceholderText(/nome do mercado/i);
    const addStoreButton = screen.getByRole('button', { name: /adicionar mercado/i });
    
    // Add first store
    fireEvent.change(storeInput, { target: { value: 'Extra' } });
    fireEvent.click(addStoreButton);
    
    // Try to add same store again
    fireEvent.change(storeInput, { target: { value: 'extra' } }); // Different case
    fireEvent.click(addStoreButton);
    
    expect(toast.error).toHaveBeenCalledWith('Mercado já adicionado', {
      description: 'O mercado "Extra" já foi adicionado à comparação.',
      duration: 3000,
    });
  });

  it('should open product modal when adding product', () => {
    render(<ComparisonForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /adicionar produto/i }));
    
    expect(screen.getByTestId('product-modal')).toBeInTheDocument();
  });

  it('should show limit warning for anonymous users', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      profile: null
    });

    render(<ComparisonForm />);
    
    const storeInput = screen.getByPlaceholderText(/nome do mercado/i);
    const addStoreButton = screen.getByRole('button', { name: /adicionar mercado/i });
    
    // Add maximum stores for anonymous users
    fireEvent.change(storeInput, { target: { value: 'Store 1' } });
    fireEvent.click(addStoreButton);
    
    fireEvent.change(storeInput, { target: { value: 'Store 2' } });
    fireEvent.click(addStoreButton);
    
    // Try to add third store
    fireEvent.change(storeInput, { target: { value: 'Store 3' } });
    fireEvent.click(addStoreButton);
    
    expect(toast.error).toHaveBeenCalledWith('Limite atingido', {
      description: 'Você pode adicionar no máximo 2 mercados. Faça login para mais!',
      duration: 3000,
    });
  });

  it('should require login for comparison', async () => {
    (useAuth as any).mockReturnValue({
      user: null,
      profile: null
    });

    render(<ComparisonForm />);
    
    const compareButton = screen.getByRole('button', { name: /fazer comparação/i });
    fireEvent.click(compareButton);
    
    expect(toast.error).toHaveBeenCalledWith('Login necessário', {
      description: 'Você precisa estar logado para fazer comparações.',
      duration: 3000,
    });
  });

  it('should handle geolocation data', () => {
    (useGeolocation as any).mockReturnValue({
      city: 'Rio de Janeiro',
      state: 'RJ',
      loading: false
    });

    render(<ComparisonForm />);
    
    // Geolocation should be used to set location automatically
    // This would be visible in the form's location field if it exists
    expect(useGeolocation).toHaveBeenCalled();
  });

  it('should save product when modal form is submitted', () => {
    render(<ComparisonForm />);
    
    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /adicionar produto/i }));
    
    // Save product
    fireEvent.click(screen.getByText('Save Product'));
    
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Test Product'));
  });

  it('should show error when trying to compare without products', async () => {
    render(<ComparisonForm />);
    
    const compareButton = screen.getByRole('button', { name: /fazer comparação/i });
    fireEvent.click(compareButton);
    
    expect(toast.error).toHaveBeenCalledWith('Adicione pelo menos um produto para fazer a comparação.');
  });

  it('should persist data in localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    
    render(<ComparisonForm />);
    
    const storeInput = screen.getByPlaceholderText(/nome do mercado/i);
    fireEvent.change(storeInput, { target: { value: 'Extra' } });
    fireEvent.click(screen.getByRole('button', { name: /adicionar mercado/i }));
    
    expect(setItemSpy).toHaveBeenCalledWith(
      'comparisonDataSaved',
      expect.stringContaining('Extra')
    );
  });
});