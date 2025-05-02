
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-md py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-app-green font-bold text-2xl">O Esperto Comparador</span>
        </Link>
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-app-dark hover:text-app-green transition-colors">
            Início
          </Link>
          <Link to="/comparison" className="text-app-dark hover:text-app-green transition-colors">
            Comparar Preços
          </Link>
          <Link to="/reports" className="text-app-dark hover:text-app-green transition-colors">
            Relatórios
          </Link>
          <Link to="/contribute" className="text-app-dark hover:text-app-green transition-colors">
            Contribuir
          </Link>
        </div>
        <Button className="bg-app-green hover:bg-green-600 text-white">Começar a Poupar</Button>
      </div>
    </nav>
  );
};

export default Navbar;
