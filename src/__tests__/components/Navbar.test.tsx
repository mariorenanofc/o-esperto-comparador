import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Navbar from '@/components/Navbar';
import { mockUser, mockProfile } from '@/test/testUtils';

// Mock useAuth hook
const mockUseAuth = vi.fn();
const mockSignOut = vi.fn();

// Mock useAdminAuth hook
const mockUseAdminAuth = vi.fn();

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  };
});

vi.mock('@/hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('@/hooks/useAdminAuth', () => ({
  useAdminAuth: mockUseAdminAuth,
}));

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      signOut: mockSignOut,
      loading: false,
    });
    
    mockUseAdminAuth.mockReturnValue({
      isAdmin: false,
      isLoaded: true,
    });
  });

  it('should render logo and navigation links', () => {
    render(<Navbar />);
    
    expect(screen.getByText('EconoCompara')).toBeInTheDocument();
    expect(screen.getByText('Comparar Preços')).toBeInTheDocument();
    expect(screen.getByText('Contribuir')).toBeInTheDocument();
    expect(screen.getByText('Ofertas')).toBeInTheDocument();
  });

  it('should show "Entrar" button when user is not authenticated', () => {
    render(<Navbar />);
    
    expect(screen.getByText('Entrar')).toBeInTheDocument();
  });

  it('should show user menu when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      signOut: mockSignOut,
      loading: false,
    });

    render(<Navbar />);
    
    // Should show user avatar/menu trigger
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.queryByText('Entrar')).not.toBeInTheDocument();
  });

  it('should show "Sair" option in user menu when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      signOut: mockSignOut,
      loading: false,
    });

    render(<Navbar />);
    
    // Click on user menu
    const userMenuButton = screen.getByRole('button');
    fireEvent.click(userMenuButton);
    
    expect(screen.getByText('Sair')).toBeInTheDocument();
  });

  it('should show "Admin" link when user is admin', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      signOut: mockSignOut,
      loading: false,
    });
    
    mockUseAdminAuth.mockReturnValue({
      isAdmin: true,
      isLoaded: true,
    });

    render(<Navbar />);
    
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should not show "Admin" link when user is not admin', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      signOut: mockSignOut,
      loading: false,
    });

    render(<Navbar />);
    
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('should handle sign out', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      signOut: mockSignOut,
      loading: false,
    });

    render(<Navbar />);
    
    // Open user menu
    const userMenuButton = screen.getByRole('button');
    fireEvent.click(userMenuButton);
    
    // Click sign out
    const signOutButton = screen.getByText('Sair');
    fireEvent.click(signOutButton);
    
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should toggle mobile menu', () => {
    render(<Navbar />);
    
    // Find mobile menu button (usually hamburger icon)
    const mobileMenuButtons = screen.getAllByRole('button');
    const mobileMenuButton = mobileMenuButtons.find(button => 
      button.getAttribute('aria-expanded') !== null
    );
    
    if (mobileMenuButton) {
      expect(mobileMenuButton.getAttribute('aria-expanded')).toBe('false');
      
      fireEvent.click(mobileMenuButton);
      
      expect(mobileMenuButton.getAttribute('aria-expanded')).toBe('true');
    }
  });

  it('should display user initials in avatar when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      signOut: mockSignOut,
      loading: false,
    });

    render(<Navbar />);
    
    // Should display user initials (T for "Test User")
    expect(screen.getByText('TU')).toBeInTheDocument();
  });

  it('should close mobile menu when link is clicked', () => {
    render(<Navbar />);
    
    // Find mobile menu button
    const mobileMenuButtons = screen.getAllByRole('button');
    const mobileMenuButton = mobileMenuButtons.find(button => 
      button.getAttribute('aria-expanded') !== null
    );
    
    if (mobileMenuButton) {
      // Open mobile menu
      fireEvent.click(mobileMenuButton);
      expect(mobileMenuButton.getAttribute('aria-expanded')).toBe('true');
      
      // Click on a navigation link
      const compareLink = screen.getByText('Comparar Preços');
      fireEvent.click(compareLink);
      
      // Menu should close
      expect(mobileMenuButton.getAttribute('aria-expanded')).toBe('false');
    }
  });
});