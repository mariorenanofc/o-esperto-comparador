
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, isLoaded } = useAdminAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  console.log('Navbar: user:', user?.id, 'isAdmin:', isAdmin, 'isLoaded:', isLoaded);
  console.log('Navbar: Should show admin button?', user && isLoaded && isAdmin);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="bg-card shadow-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingCart className="h-8 w-8 text-app-secondary" />
            <span className="text-xl font-bold text-foreground">
              O Esperto Comparador
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/comparison" 
              className="text-muted-foreground hover:text-app-secondary transition-colors"
            >
              Comparar Preços
            </Link>
            <Link 
              to="/contribute" 
              className="text-muted-foreground hover:text-app-secondary transition-colors"
            >
              Contribuir
            </Link>
            <Link 
              to="/reports" 
              className="text-muted-foreground hover:text-app-secondary transition-colors"
            >
              Relatórios
            </Link>
            <Link 
              to="/plans" 
              className="text-muted-foreground hover:text-app-secondary transition-colors"
            >
              Planos
            </Link>
            
            {/* Admin Link - Only visible to administrators */}
            {user && isLoaded && isAdmin && (
              <Link 
                to="/admin" 
                className="text-muted-foreground hover:text-app-secondary transition-colors flex items-center gap-1"
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Perfil
                  </Button>
                </Link>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                  <AvatarFallback className="bg-app-secondary text-primary-foreground text-sm">
                    {getUserInitials(user.email || "")}
                  </AvatarFallback>
                </Avatar>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                >
                  Sair
                </Button>
              </div>
            ) : (
              <Link to="/sign-in">
                <Button size="sm" className="bg-app-primary hover:bg-app-primary/90 text-primary-foreground">
                  Entrar com Google
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="text-muted-foreground hover:text-app-secondary transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <div className="flex flex-col space-y-4 pt-4">
              <Link 
                to="/comparison" 
                className="text-muted-foreground hover:text-app-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Comparar Preços
              </Link>
              <Link 
                to="/contribute" 
                className="text-muted-foreground hover:text-app-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contribuir
              </Link>
              <Link 
                to="/reports" 
                className="text-muted-foreground hover:text-app-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Relatórios
              </Link>
              <Link 
                to="/plans" 
                className="text-muted-foreground hover:text-app-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Planos
              </Link>
              
              {/* Admin Link Mobile - Only visible to administrators */}
              {user && isLoaded && isAdmin && (
                <Link 
                  to="/admin" 
                  className="text-muted-foreground hover:text-app-secondary transition-colors flex items-center gap-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </Link>
              )}

              {user ? (
                <div className="flex flex-col space-y-3">
                  <Link 
                    to="/profile" 
                    className="text-muted-foreground hover:text-app-secondary transition-colors flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Meu Perfil
                  </Link>
                  <div className="flex items-center space-x-3 pt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                      <AvatarFallback className="bg-app-secondary text-primary-foreground text-sm">
                        {getUserInitials(user.email || "")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                    <Button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Sair
                    </Button>
                  </div>
                </div>
              ) : (
                <Link to="/sign-in" onClick={() => setIsMenuOpen(false)}>
                  <Button size="sm" className="bg-app-primary hover:bg-app-primary/90 text-primary-foreground w-full">
                    Entrar com Google
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
