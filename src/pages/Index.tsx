
import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-app-gray">
      <Navbar />
      <HeroSection />
      
      <div className="container mx-auto py-16 px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Como Funciona</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            O Esperto Comparador ajuda você a encontrar os melhores preços em diferentes 
            supermercados de forma simples e eficiente.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-app-green rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Adicione Produtos</h3>
            <p className="text-gray-600">
              Insira os produtos que deseja comparar e os preços em diferentes supermercados.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-app-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Compare Preços</h3>
            <p className="text-gray-600">
              Veja instantaneamente onde cada produto está mais barato e quanto você pode economizar.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-app-green rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Economize</h3>
            <p className="text-gray-600">
              Faça suas compras com base nos resultados e acompanhe sua economia ao longo do tempo.
            </p>
          </div>
        </div>
        
        <div className="mt-20 bg-white p-8 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
              <h2 className="text-2xl font-bold mb-4">Por que usar o Esperto Comparador?</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-app-green font-bold mr-2">✓</span>
                  <span>Economize tempo e dinheiro em suas compras de supermercado</span>
                </li>
                <li className="flex items-start">
                  <span className="text-app-green font-bold mr-2">✓</span>
                  <span>Compare preços em diferentes mercados de forma rápida e fácil</span>
                </li>
                <li className="flex items-start">
                  <span className="text-app-green font-bold mr-2">✓</span>
                  <span>Acompanhe seus gastos mensais e identifique oportunidades de economia</span>
                </li>
                <li className="flex items-start">
                  <span className="text-app-green font-bold mr-2">✓</span>
                  <span>Interface intuitiva e fácil de usar</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1579113800032-c38bd7635818?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                alt="Economizando nas compras" 
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-app-dark text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">O Esperto Comparador</h3>
              <p className="text-gray-300">
                Economize tempo e dinheiro nas suas compras de supermercado.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold mb-2">Links</h3>
                <ul className="space-y-1">
                  <li><a href="/" className="text-gray-300 hover:text-white">Início</a></li>
                  <li><a href="/comparison" className="text-gray-300 hover:text-white">Comparar</a></li>
                  <li><a href="/reports" className="text-gray-300 hover:text-white">Relatórios</a></li>
                  <li><a href="/contribute" className="text-gray-300 hover:text-white">Contribuir</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Legal</h3>
                <ul className="space-y-1">
                  <li><a href="#" className="text-gray-300 hover:text-white">Termos</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Privacidade</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-gray-300 text-sm">© 2025 O Esperto Comparador. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
