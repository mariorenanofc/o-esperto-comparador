import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Página não encontrada</p>
        <Link 
          to="/" 
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Voltar para o Início
        </Link>
      </div>
    </div>
  );
};

export default NotFound;