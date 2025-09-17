import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UserManagementAdvanced } from '@/components/admin/UserManagementAdvanced';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabaseAdminService } from '@/services/supabase/adminService';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

vi.mock('@/services/supabase/adminService', () => ({
  supabaseAdminService: {
    getAllUsers: vi.fn()
  }
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn()
  }
}));

// Mock user data
const mockUsers = [
  {
    id: '1',
    email: 'user1@test.com',
    name: 'User One',
    plan: 'premium',
    created_at: '2023-01-01T00:00:00.000Z',
    is_online: true,
    last_activity: '2023-06-01T10:00:00.000Z',
    comparisons_made_this_month: 5
  },
  {
    id: '2',
    email: 'user2@test.com',
    name: 'User Two',
    plan: 'free',
    created_at: '2023-02-01T00:00:00.000Z',
    is_online: false,
    last_activity: '2023-05-15T15:30:00.000Z',
    comparisons_made_this_month: 2
  },
  {
    id: '3',
    email: 'admin@test.com',
    name: 'Admin User',
    plan: 'admin',
    created_at: '2023-01-15T00:00:00.000Z',
    is_online: true,
    last_activity: '2023-06-01T09:00:00.000Z',
    comparisons_made_this_month: 0
  }
];

describe('UserManagementAdvanced', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useAuth as any).mockReturnValue({
      user: { id: 'admin-id', email: 'admin@test.com' }
    });

    (useNavigate as any).mockReturnValue(mockNavigate);
    (supabaseAdminService.getAllUsers as any).mockResolvedValue(mockUsers);
  });

  it('should render loading state initially', () => {
    render(<UserManagementAdvanced />);
    expect(screen.getByText('Carregando usuários...')).toBeInTheDocument();
  });

  it('should render users table after loading', async () => {
    render(<UserManagementAdvanced />);

    await waitFor(() => {
      expect(screen.getByText('Gerenciamento Avançado de Usuários')).toBeInTheDocument();
    });

    expect(screen.getByText('User One')).toBeInTheDocument();
    expect(screen.getByText('user1@test.com')).toBeInTheDocument();
    expect(screen.getByText('User Two')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('should display correct statistics', async () => {
    render(<UserManagementAdvanced />);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // Total users
    });

    expect(screen.getByText('2')).toBeInTheDocument(); // Online users
    expect(screen.getByText('2')).toBeInTheDocument(); // Premium users (premium + admin)
  });

  it('should filter users by search term', async () => {
    render(<UserManagementAdvanced />);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Nome ou email...');
    fireEvent.change(searchInput, { target: { value: 'User One' } });

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.queryByText('User Two')).not.toBeInTheDocument();
    });
  });

  it('should filter users by plan', async () => {
    render(<UserManagementAdvanced />);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });

    // Find and click the plan filter select
    const planSelect = screen.getByDisplayValue('Todos os planos');
    fireEvent.click(planSelect);
    
    const premiumOption = screen.getByText('Premium');
    fireEvent.click(premiumOption);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.queryByText('User Two')).not.toBeInTheDocument();
    });
  });

  it('should filter users by status', async () => {
    render(<UserManagementAdvanced />);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });

    // Find and click the status filter select
    const statusSelect = screen.getByDisplayValue('Todos os status');
    fireEvent.click(statusSelect);
    
    const onlineOption = screen.getByText('Online');
    fireEvent.click(onlineOption);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.queryByText('User Two')).not.toBeInTheDocument();
    });
  });

  it('should navigate to user details when clicking on user row', async () => {
    render(<UserManagementAdvanced />);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });

    const userRow = screen.getByText('User One').closest('tr');
    fireEvent.click(userRow!);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/users/1');
  });

  it('should navigate to user details when clicking "Ver Detalhes" button', async () => {
    render(<UserManagementAdvanced />);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });

    const detailsButtons = screen.getAllByText('Ver Detalhes');
    fireEvent.click(detailsButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/users/1');
  });

  it('should handle refresh button click', async () => {
    render(<UserManagementAdvanced />);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /atualizar/i });
    fireEvent.click(refreshButton);

    expect(supabaseAdminService.getAllUsers).toHaveBeenCalledTimes(2);
  });

  it('should handle CSV export', async () => {
    // Mock URL.createObjectURL and related DOM methods
    global.URL.createObjectURL = vi.fn(() => 'mocked-url');
    global.URL.revokeObjectURL = vi.fn();
    
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn()
    };
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

    render(<UserManagementAdvanced />);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });

    const csvButton = screen.getByRole('button', { name: /csv/i });
    fireEvent.click(csvButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Relatório CSV gerado com sucesso');
    });

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(mockLink.click).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();

    // Cleanup
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('should handle API error', async () => {
    (supabaseAdminService.getAllUsers as any).mockRejectedValue(new Error('API Error'));

    render(<UserManagementAdvanced />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar usuários');
    });
  });

  it('should display correct plan badges', async () => {
    render(<UserManagementAdvanced />);

    await waitFor(() => {
      expect(screen.getByText('Premium')).toBeInTheDocument();
      expect(screen.getByText('Free')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  it('should display correct status badges', async () => {
    render(<UserManagementAdvanced />);

    await waitFor(() => {
      expect(screen.getAllByText('Online')).toHaveLength(2); // Two online users
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });
  });

  it('should show "no users found" message when filtered results are empty', async () => {
    render(<UserManagementAdvanced />);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Nome ou email...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent user' } });

    await waitFor(() => {
      expect(screen.getByText('Nenhum usuário encontrado com os filtros aplicados.')).toBeInTheDocument();
    });
  });

  it('should handle pagination correctly', async () => {
    // Mock more users to test pagination
    const manyUsers = Array.from({ length: 25 }, (_, i) => ({
      id: `user-${i}`,
      email: `user${i}@test.com`,
      name: `User ${i}`,
      plan: 'free',
      created_at: '2023-01-01T00:00:00.000Z',
      is_online: false,
      last_activity: null,
      comparisons_made_this_month: 0
    }));

    (supabaseAdminService.getAllUsers as any).mockResolvedValue(manyUsers);

    render(<UserManagementAdvanced />);

    await waitFor(() => {
      expect(screen.getByText('Mostrando 1 a 10 de 25 usuários')).toBeInTheDocument();
    });

    // Should have pagination buttons
    expect(screen.getByText('Próxima')).toBeInTheDocument();
    expect(screen.getByText('Anterior')).toBeInTheDocument();
  });
});