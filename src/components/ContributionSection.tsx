
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useContributionActions } from "@/hooks/useContributionActions";
import ContributionModal from "@/components/ContributionModal";
import PriceContributionForm from "@/components/PriceContributionForm";
import SuggestionForm from "@/components/SuggestionForm";

const ContributionSection: React.FC = () => {
  const {
    handleSharePrices,
    handleSuggestImprovement,
    handleShareApp,
    handleStartContributing,
    isPriceModalOpen,
    isSuggestionModalOpen,
    closePriceModal,
    closeSuggestionModal,
  } = useContributionActions();

  return (
    <div className="space-y-10">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-app-dark mb-4">
          Contribua com o Comparador Online
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Ajude a nossa comunidade a economizar mais! Compartilhe seus conhecimentos
          e experiências para tornar o Comparador Online ainda melhor.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Compartilhe Preços</CardTitle>
            <CardDescription>
              Atualize nossa base de dados com os preços mais recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Ao compartilhar os preços que você encontra durante suas compras,
              você ajuda outros usuários a economizarem dinheiro e tempo.
            </p>
            <Button 
              className="w-full bg-app-blue hover:bg-blue-700"
              onClick={handleSharePrices}
            >
              Enviar Preços
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sugira Melhorias</CardTitle>
            <CardDescription>
              Suas ideias são importantes para nós
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Tem alguma ideia para melhorar nossa plataforma? Compartilhe conosco
              e ajude a criar uma ferramenta ainda mais útil.
            </p>
            <Button 
              className="w-full bg-app-blue hover:bg-blue-700"
              onClick={handleSuggestImprovement}
            >
              Enviar Sugestão
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Divulgue o App</CardTitle>
            <CardDescription>
              Ajude mais pessoas a economizarem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Quanto mais pessoas usarem o Comparador Online, mais dados
              teremos para oferecer comparações precisas e atualizadas.
            </p>
            <Button 
              className="w-full bg-app-blue hover:bg-blue-700"
              onClick={handleShareApp}
            >
              Compartilhar
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-app-gray p-8 rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Como funciona nossa comunidade
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-medium mb-3 text-app-green">
              Dados colaborativos
            </h3>
            <p className="text-gray-600">
              Nossa base de preços é alimentada pelos próprios usuários, criando
              uma rede de informações sempre atualizada e precisa. Quanto mais
              usuários contribuírem, melhores serão nossas comparações.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-3 text-app-green">
              Verificação de qualidade
            </h3>
            <p className="text-gray-600">
              Nossa equipe verifica regularmente os dados enviados para garantir
              a precisão das informações. Também utilizamos algoritmos para
              detectar anomalias e manter a confiabilidade da plataforma.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Pronto para começar a contribuir?
        </h2>
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">
          Junte-se ao nosso grupo do WhatsApp e faça parte da comunidade de usuários 
          engajados que estão transformando a forma como fazemos compras!
        </p>
        <Button 
          size="lg" 
          className="bg-app-green hover:bg-green-700"
          onClick={handleStartContributing}
        >
          Entrar no Grupo do WhatsApp
        </Button>
      </div>

      {/* Modais */}
      <ContributionModal isOpen={isPriceModalOpen} onClose={closePriceModal}>
        <PriceContributionForm onClose={closePriceModal} />
      </ContributionModal>

      <ContributionModal isOpen={isSuggestionModalOpen} onClose={closeSuggestionModal}>
        <SuggestionForm onClose={closeSuggestionModal} />
      </ContributionModal>
    </div>
  );
};

export default ContributionSection;
