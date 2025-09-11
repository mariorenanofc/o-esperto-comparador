import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ThemeProvider from '@/components/ThemeProvider';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';

// Create a test query client with no retries and no cache time
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  { queryClient = createTestQueryClient(), ...renderOptions }: CustomRenderOptions = {}
) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
};

// Mock user data for tests
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User',
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
  },
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
};

export const mockProfile = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  plan: 'free' as const,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  last_activity: '2023-01-01T00:00:00Z',
  is_online: true,
  comparisons_made_this_month: 0,
  last_comparison_reset_month: new Date().getMonth(),
};

// Mock comparison data
export const mockComparisonData = {
  products: [
    {
      id: 'product-1',
      name: 'Arroz Branco 5kg',
      quantity: 1,
      unit: 'pacote',
      category: 'graos',
      prices: {
        'store-1': 12.99,
        'store-2': 14.50,
      },
    },
  ],
  stores: [
    { id: 'store-1', name: 'Supermercado A' },
    { id: 'store-2', name: 'Supermercado B' },
  ],
  location: 'São Paulo/SP',
  date: new Date(),
};

// Test utilities for async operations
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0));

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };