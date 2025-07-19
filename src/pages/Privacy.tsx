import React from "react";
import Navbar from "@/components/Navbar";

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-app-gray dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto py-8 px-6 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 dark:text-gray-200">
          Política de Privacidade - Comparador Online
        </h1>

        <div className="bg-white dark:bg-gray-950 rounded-lg shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              1. Informações Coletadas
            </h2>
            <p className="text-gray-600 mb-3">
              Coletamos as seguintes informações quando você utiliza nossa
              plataforma:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>
                Informações de conta (fornecidas pelo Clerk para autenticação)
              </li>
              <li>
                Contribuições de preços (produto, loja, preço, localização)
              </li>
              <li>
                Feedbacks e sugestões (nome, email, telefone quando fornecidos
                voluntariamente)
              </li>
              <li>Dados de uso da plataforma para melhorias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              2. Como Utilizamos suas Informações
            </h2>
            <p className="text-gray-600 mb-3">
              Suas informações são utilizadas para:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Fornecer o serviço de comparação de preços</li>
              <li>Verificar a qualidade das contribuições</li>
              <li>Melhorar a experiência do usuário</li>
              <li>Responder a feedbacks e sugestões</li>
              <li>Manter a segurança da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              3. Compartilhamento de Dados
            </h2>
            <p className="text-gray-600 mb-3">
              Seus dados são compartilhados apenas quando necessário:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>
                Contribuições de preços são públicas para todos os usuários
              </li>
              <li>
                Nome do contribuidor é exibido de forma abreviada (ex: "João
                S.")
              </li>
              <li>
                Dados pessoais completos são visíveis apenas para
                administradores
              </li>
              <li>
                Não vendemos ou compartilhamos dados com terceiros para fins
                comerciais
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              4. Retenção de Dados
            </h2>
            <p className="text-gray-600">
              Implementamos uma política de retenção limitada:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mt-3">
              <li>
                Contribuições de preços são automaticamente removidas após 24
                horas
              </li>
              <li>
                Feedbacks são mantidos por tempo limitado para análise
                administrativa
              </li>
              <li>
                Dados de conta são mantidos enquanto a conta estiver ativa
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Seus Direitos</h2>
            <p className="text-gray-600 mb-3">Você tem direito a:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Acessar suas informações pessoais</li>
              <li>Solicitar correção de dados incorretos</li>
              <li>Solicitar exclusão de sua conta e dados</li>
              <li>Retirar seu consentimento a qualquer momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Segurança</h2>
            <p className="text-gray-600">
              Implementamos medidas de segurança para proteger suas informações,
              incluindo autenticação segura através do Clerk, armazenamento
              temporário de dados sensíveis, e acesso restrito a informações
              pessoais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              7. Cookies e Tecnologias
            </h2>
            <p className="text-gray-600">
              Utilizamos cookies e tecnologias similares para melhorar a
              experiência do usuário, manter sessões de login, e analisar o uso
              da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              8. Alterações na Política
            </h2>
            <p className="text-gray-600">
              Esta política pode ser atualizada periodicamente. Alterações
              significativas serão comunicadas através da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contato</h2>
            <p className="text-gray-600">
              Para questões sobre privacidade ou exercer seus direitos, entre em
              contato através da seção "Sugira Melhorias" em nossa página de
              contribuições.
            </p>
          </section>

          <div className="border-t pt-6 mt-8 text-center">
            {/* Ano atualizado automaticamente */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Comparador Online. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
