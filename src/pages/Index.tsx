
import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DailyOffersSection from "@/components/DailyOffersSection";
import { PlanStatus } from "@/components/PlanStatus";
import { useAuth } from "@/hooks/useAuth";

const Index: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-app-gray dark:bg-gray-900">
      <Navbar />
      <HeroSection />
      <DailyOffersSection />
      
      <div className="container mx-auto py-8 sm:py-16 px-4 sm:px-6">
        {/* Status do Plano - apenas para usuários logados */}
        {user && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-app-dark dark:text-white">Meu Plano</h2>
            <div className="max-w-md">
              <PlanStatus />
            </div>
          </div>
        )}

        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-app-dark dark:text-white">Como Funciona</h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            O Comparador Online ajuda você a encontrar os melhores preços em diferentes 
            supermercados de forma simples e eficiente.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md text-center border dark:border-gray-700">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-app-green rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-lg sm:text-2xl font-bold">1</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-app-dark dark:text-white">Adicione Produtos</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Insira os produtos que deseja comparar e os preços em diferentes supermercados.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md text-center border dark:border-gray-700">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-app-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-lg sm:text-2xl font-bold">2</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-app-dark dark:text-white">Compare Preços</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Veja instantaneamente onde cada produto está mais barato e quanto você pode economizar.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md text-center sm:col-span-2 lg:col-span-1 border dark:border-gray-700">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-app-green rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-lg sm:text-2xl font-bold">3</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-app-dark dark:text-white">Economize</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Faça suas compras com base nos resultados e acompanhe sua economia ao longo do tempo.
            </p>
          </div>
        </div>
        
        <div className="mt-12 sm:mt-20 bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-lg shadow-md border dark:border-gray-700">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-6 lg:mb-0 lg:pr-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-app-dark dark:text-white">Por que usar o Comparador Online?</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-app-green font-bold mr-2 mt-1">✓</span>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Economize tempo e dinheiro em suas compras de supermercado</span>
                </li>
                <li className="flex items-start">
                  <span className="text-app-green font-bold mr-2 mt-1">✓</span>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Compare preços em diferentes mercados de forma rápida e fácil</span>
                </li>
                <li className="flex items-start">
                  <span className="text-app-green font-bold mr-2 mt-1">✓</span>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Acompanhe seus gastos mensais e identifique oportunidades de economia</span>
                </li>
                <li className="flex items-start">
                  <span className="text-app-green font-bold mr-2 mt-1">✓</span>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Interface intuitiva e fácil de usar</span>
                </li>
              </ul>
            </div>
            <div className="lg:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1579113800032-c38bd7635818?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                alt="Economizando nas compras" 
                className="rounded-lg shadow-lg w-full max-w-md mx-auto"
              />
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-app-dark dark:bg-gray-950 text-white py-6 sm:py-8 border-t dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row justify-between">
            <div className="mb-6 lg:mb-0">
              <h3 className="text-lg font-semibold mb-2">Comparador Online</h3>
              <p className="text-gray-300 dark:text-gray-400 text-sm sm:text-base">
                Economize tempo e dinheiro nas suas compras de supermercado.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold mb-2">Links</h3>
                <ul className="space-y-1">
                  <li><a href="/" className="text-gray-300 dark:text-gray-400 hover:text-white text-sm">Início</a></li>
                  <li><a href="/comparison" className="text-gray-300 dark:text-gray-400 hover:text-white text-sm">Comparar</a></li>
                  <li><a href="/reports" className="text-gray-300 dark:text-gray-400 hover:text-white text-sm">Relatórios</a></li>
                  <li><a href="/contribute" className="text-gray-300 dark:text-gray-400 hover:text-white text-sm">Contribuir</a></li>
                  <li><a href="/plans" className="text-gray-300 dark:text-gray-400 hover:text-white text-sm">Planos</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Legal</h3>
                <ul className="space-y-1">
                  <li><a href="/terms" className="text-gray-300 dark:text-gray-400 hover:text-white text-sm">Termos</a></li>
                  <li><a href="/privacy" className="text-gray-300 dark:text-gray-400 hover:text-white text-sm">Privacidade</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 dark:border-gray-800 mt-6 sm:mt-8 pt-4 sm:pt-6 text-center">
            <p className="text-gray-300 dark:text-gray-400 text-xs sm:text-sm">© 2025 Comparador Online. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
