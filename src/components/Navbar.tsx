
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingCart className="h-8 w-8 text-app-green" />
            <span className="text-xl font-bold text-app-dark">
              O Esperto Comparador
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/comparison" 
              className="text-gray-700 hover:text-app-green transition-colors"
            >
              Comparar Preços
            </Link>
            <Link 
              to="/contribute" 
              className="text-gray-700 hover:text-app-green transition-colors"
            >
              Contribuir
            </Link>
            <Link 
              to="/reports" 
              className="text-gray-700 hover:text-app-green transition-colors"
            >
              Relatórios
            </Link>
            <Link 
              to="/plans" 
              className="text-gray-700 hover:text-app-green transition-colors"
            >
              Planos
            </Link>
            
            {/* Admin Link - Only visible to administrators */}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="text-gray-700 hover:text-app-green transition-colors flex items-center gap-1"
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                  <AvatarFallback className="bg-app-green text-white text-sm">
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
                <Button size="sm" className="bg-app-green hover:bg-green-600">
                  Entrar com Google
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-app-green transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4 pt-4">
              <Link 
                to="/comparison" 
                className="text-gray-700 hover:text-app-green transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Comparar Preços
              </Link>
              <Link 
                to="/contribute" 
                className="text-gray-700 hover:text-app-green transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contribuir
              </Link>
              <Link 
                to="/reports" 
                className="text-gray-700 hover:text-app-green transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Relatórios
              </Link>
              <Link 
                to="/plans" 
                className="text-gray-700 hover:text-app-green transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Planos
              </Link>
              
              {/* Admin Link Mobile - Only visible to administrators */}
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="text-gray-700 hover:text-app-green transition-colors flex items-center gap-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </Link>
              )}

              {user ? (
                <div className="flex items-center space-x-3 pt-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                    <AvatarFallback className="bg-app-green text-white text-sm">
                      {getUserInitials(user.email || "")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">{user.email}</span>
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
              ) : (
                <Link to="/sign-in" onClick={() => setIsMenuOpen(false)}>
                  <Button size="sm" className="bg-app-green hover:bg-green-600 w-full">
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
