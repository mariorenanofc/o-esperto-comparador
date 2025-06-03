
import React from "react";

const LoadingState: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-app-dark mb-4">
            🔥 Ofertas do Dia
          </h2>
          <p className="text-lg text-gray-600">Carregando ofertas...</p>
        </div>
      </div>
    </section>
  );
};

export default LoadingState;
