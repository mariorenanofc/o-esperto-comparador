
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Shield, Menu, X } from "lucide-react";

const Navbar: React.FC = () => {
  const { isAdmin } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-green-600">
            CompraInteligente
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
            
            <SignedIn>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="flex items-center text-purple-600 hover:text-purple-700 transition-colors font-medium"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Admin
                </Link>
              )}
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Entrar
                </button>
              </SignInButton>
            </SignedOut>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
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
              
              <SignedIn>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="flex items-center text-purple-600 hover:text-purple-700 transition-colors font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    Admin
                  </Link>
                )}
              </SignedIn>
              
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-full text-left">
                    Entrar
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
