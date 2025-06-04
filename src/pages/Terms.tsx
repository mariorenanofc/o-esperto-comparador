
import React from "react";
import Navbar from "@/components/Navbar";

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-app-gray">
      <Navbar />
      <div className="container mx-auto py-8 px-6 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Termos de Uso - Comparador Online
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
            <p className="text-gray-600">
              Ao utilizar o Comparador Online, você concorda com estes termos de uso. 
              Se não concordar com qualquer parte destes termos, não utilize nossa plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Sobre o Serviço</h2>
            <p className="text-gray-600 mb-3">
              O Comparador Online é uma plataforma colaborativa que permite aos usuários:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Comparar preços de produtos em diferentes estabelecimentos</li>
              <li>Contribuir com informações de preços encontrados durante suas compras</li>
              <li>Visualizar ofertas do dia compartilhadas pela comunidade</li>
              <li>Gerar relatórios de economia</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Contribuições dos Usuários</h2>
            <p className="text-gray-600 mb-3">
              As contribuições de preços são temporárias e válidas apenas por 24 horas, sendo automaticamente removidas após esse período. Ao contribuir, você:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Garante que as informações fornecidas são verdadeiras e precisas</li>
              <li>Entende que suas contribuições serão verificadas por outros usuários</li>
              <li>Aceita que suas contribuições podem ser moderadas ou removidas</li>
              <li>Concorda que as informações serão compartilhadas com a comunidade</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Uso Responsável</h2>
            <p className="text-gray-600 mb-3">Você se compromete a:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Fornecer informações precisas e atuais</li>
              <li>Não utilizar a plataforma para fins comerciais não autorizados</li>
              <li>Respeitar outros usuários e a comunidade</li>
              <li>Não tentar prejudicar o funcionamento da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Limitação de Responsabilidade</h2>
            <p className="text-gray-600">
              O Comparador Online é uma plataforma informativa. Não nos responsabilizamos por:
              decisões de compra baseadas nas informações da plataforma, preços incorretos 
              fornecidos por usuários, ou perdas financeiras decorrentes do uso da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Modificações</h2>
            <p className="text-gray-600">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. 
              As alterações serão comunicadas através da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contato</h2>
            <p className="text-gray-600">
              Para dúvidas sobre estes termos, entre em contato através da seção 
              "Sugira Melhorias" em nossa página de contribuições.
            </p>
          </section>

          <div className="border-t pt-6 mt-8">
            <p className="text-sm text-gray-500">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
