
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-app-green font-bold text-2xl">
            O Esperto Comparador
          </span>
        </Link>
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-app-dark hover:text-app-green transition-colors">
            Início
          </Link>
          <Link to="/comparison" className="text-app-dark hover:text-app-green transition-colors">
            Comparar Preços
          </Link>
          <SignedIn>
            <Link to="/reports" className="text-app-dark hover:text-app-green transition-colors">
              Relatórios
            </Link>
          </SignedIn>
          <Link to="/contribute" className="text-app-dark hover:text-app-green transition-colors">
            Contribuir
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button className="bg-app-green hover:bg-green-600 text-white">
                Login / Cadastro
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
