
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Shield, Menu, X, Crown, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Navbar: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { currentPlan } = useSubscription();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lista de User IDs que são administradores
  const ADMIN_USER_IDS = [
    'f47ac10b-58cc-4372-a567-0e02b2c3d479', // Substitua pelos IDs reais dos usuários admin
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8', // Substitua pelos IDs reais dos usuários admin
  ];

  const isAdmin = user ? ADMIN_USER_IDS.includes(user.id) : false;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = (user: any) => {
    if (profile?.name) {
      return profile.name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = (user: any) => {
    if (profile?.name) {
      return profile.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuário';
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-green-600">
            Comparador Online
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors">
              Início
            </Link>
            <Link to="/comparison" className="text-gray-700 hover:text-green-600 transition-colors">
              Comparar Preços
            </Link>
            <Link to="/contribute" className="text-gray-700 hover:text-green-600 transition-colors">
              Contribuir
            </Link>
            <Link to="/reports" className="text-gray-700 hover:text-green-600 transition-colors">
              Relatórios
            </Link>
            <Link 
              to="/plans" 
              className="flex items-center text-yellow-600 hover:text-yellow-700 transition-colors font-medium"
            >
              <Crown className="w-4 h-4 mr-1" />
              Planos
              {currentPlan !== 'free' && (
                <Badge className="ml-2 bg-yellow-500 text-xs">
                  {currentPlan}
                </Badge>
              )}
            </Link>
            
            {user ? (
              <>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="flex items-center text-purple-600 hover:text-purple-700 transition-colors font-medium"
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user.user_metadata?.avatar_url || user.user_metadata?.picture} 
                        alt={getUserDisplayName(user)}
                      />
                      <AvatarFallback className="text-sm">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600 hidden lg:block">
                      {getUserDisplayName(user)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center space-x-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </Button>
                </div>
              </>
            ) : (
              <Link to="/sign-in">
                <Button className="bg-green-600 text-white hover:bg-green-700">
                  Entrar
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user.user_metadata?.avatar_url || user.user_metadata?.picture} 
                    alt={getUserDisplayName(user)}
                  />
                  <AvatarFallback className="text-sm">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-green-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4 pt-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-green-600 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Início
              </Link>
              <Link 
                to="/comparison" 
                className="text-gray-700 hover:text-green-600 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Comparar Preços
              </Link>
              <Link 
                to="/contribute" 
                className="text-gray-700 hover:text-green-600 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contribuir
              </Link>
              <Link 
                to="/reports" 
                className="text-gray-700 hover:text-green-600 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Relatórios
              </Link>
              <Link 
                to="/plans" 
                className="flex items-center text-yellow-600 hover:text-yellow-700 transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Crown className="w-4 h-4 mr-1" />
                Planos
                {currentPlan !== 'free' && (
                  <Badge className="ml-2 bg-yellow-500 text-xs">
                    {currentPlan}
                  </Badge>
                )}
              </Link>
              
              {user && isAdmin && (
                <Link 
                  to="/admin" 
                  className="flex items-center text-purple-600 hover:text-purple-700 transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Admin
                </Link>
              )}
              
              {!user && (
                <Link to="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="bg-green-600 text-white hover:bg-green-700 w-full">
                    Entrar
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
