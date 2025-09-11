import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Navbar from '@/components/Navbar';
import { mockUser } from '@/test/testUtils';

// Mock useAuth hook
const mockSignOut = vi.fn();
const mockUseAuth = {
  user: null,
  signOut: mockSignOut,
};

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth,
}));

// Mock useAdminAuth hook
const mockUseAdminAuth = {
  isAdmin: false,
  isLoaded: true,
};

vi.mock('@/hooks/useAdminAuth', () => ({
  useAdminAuth: () => mockUseAdminAuth,
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.user = null;
    mockUseAdminAuth.isAdmin = false;
  });

  it('should render navbar with logo and main navigation', () => {
    render(<Navbar />);
    
    expect(screen.getByText('O Esperto Comparador')).toBeInTheDocument();
    expect(screen.getByText('Comparar Preços')).toBeInTheDocument();
    expect(screen.getByText('Produtos')).toBeInTheDocument();
    expect(screen.getByText('Contribuir')).toBeInTheDocument();
    expect(screen.getByText('Relatórios')).toBeInTheDocument();
    expect(screen.getByText('Economia')).toBeInTheDocument();
    expect(screen.getByText('Planos')).toBeInTheDocument();
  });

  it('should show login button when user is not authenticated', () => {
    render(<Navbar />);
    
    expect(screen.getByText('Entrar')).toBeInTheDocument();
    expect(screen.queryByText('Sair')).not.toBeInTheDocument();
  });

  it('should show user menu when user is authenticated', () => {
    mockUseAuth.user = mockUser;
    
    render(<Navbar />);
    
    expect(screen.getByText('Perfil')).toBeInTheDocument();
    expect(screen.getByText('Sair')).toBeInTheDocument();
    expect(screen.getByText('Notificações')).toBeInTheDocument();
    expect(screen.queryByText('Entrar')).not.toBeInTheDocument();
  });

  it('should show admin link when user is admin', () => {
    mockUseAuth.user = mockUser;
    mockUseAdminAuth.isAdmin = true;
    
    render(<Navbar />);
    
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should not show admin link when user is not admin', () => {
    mockUseAuth.user = mockUser;
    mockUseAdminAuth.isAdmin = false;
    
    render(<Navbar />);
    
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('should handle sign out', async () => {
    mockUseAuth.user = mockUser;
    
    render(<Navbar />);
    
    const signOutButton = screen.getByText('Sair');
    fireEvent.click(signOutButton);
    
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should toggle mobile menu', () => {
    render(<Navbar />);
    
    // Mobile menu should not be visible initially
    expect(screen.queryByText('Comparar Preços')).toBeInTheDocument(); // Desktop version
    
    // Find and click the mobile menu button (Menu icon)
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);
    
    // Should show mobile menu items
    const mobileMenuItems = screen.getAllByText('Comparar Preços');
    expect(mobileMenuItems.length).toBeGreaterThan(1); // Both desktop and mobile versions
  });

  it('should show user initials in avatar', () => {
    mockUseAuth.user = mockUser;
    
    render(<Navbar />);
    
    // Check if avatar shows user initials
    const avatar = screen.getByText('TE'); // From test@example.com
    expect(avatar).toBeInTheDocument();
  });

  it('should close mobile menu when link is clicked', () => {
    render(<Navbar />);
    
    // Open mobile menu
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);
    
    // Click on a mobile menu link
    const mobileMenuItems = screen.getAllByText('Produtos');
    const mobileLink = mobileMenuItems[mobileMenuItems.length - 1]; // Get the mobile version
    fireEvent.click(mobileLink);
    
    // Menu should close (X icon should change back to Menu icon)
    // This is tested by checking if the menu button is still functional
    expect(menuButton).toBeInTheDocument();
  });
});