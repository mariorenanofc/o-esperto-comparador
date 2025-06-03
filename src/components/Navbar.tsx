
import React from "react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Shield } from "lucide-react";

const Navbar: React.FC = () => {
  const { isAdmin } = useAdminAuth();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-green-600">
            CompraInteligente
          </Link>
          
          <div className="flex items-center space-x-6">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
