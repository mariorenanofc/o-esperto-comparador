
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, MessageSquare } from "lucide-react";
import PriceContributionForm from "./PriceContributionForm";
import SuggestionForm from "./SuggestionForm";
import ContributionModal from "./ContributionModal";

const ContributionSection: React.FC = () => {
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Contribua com Nossa Comunidade
        </h1>
        <p className="text-lg text-gray-600">
          Ajude outros usuários compartilhando preços ou enviando sugestões
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contribuir com Preços */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Compartilhar Preços</CardTitle>
                <CardDescription>
                  Ajude a comunidade com preços atualizados
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Compartilhe preços de produtos que você encontrou recentemente. 
              Sua contribuição ajuda outros usuários a encontrar as melhores ofertas.
            </p>
            <Button 
              onClick={() => setShowPriceForm(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Compartilhar Preço
            </Button>
          </CardContent>
        </Card>

        {/* Enviar Sugestões */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Enviar Sugestão</CardTitle>
                <CardDescription>
                  Sugira melhorias ou reporte problemas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Tem uma ideia para melhorar nossa plataforma? Encontrou algum problema? 
              Envie sua sugestão e nos ajude a crescer.
            </p>
            <Button 
              onClick={() => setShowSuggestionForm(true)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Enviar Sugestão
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Por que contribuir?
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                🎯 Compartilhar Preços
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ajuda outros usuários a economizar</li>
                <li>• Mantém nossa base de dados atualizada</li>
                <li>• Fortalece a comunidade</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                💡 Enviar Sugestões
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Nos ajuda a melhorar a plataforma</li>
                <li>• Sua opinião é importante</li>
                <li>• Contribui para novas funcionalidades</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modais */}
      <ContributionModal 
        isOpen={showPriceForm} 
        onClose={() => setShowPriceForm(false)}
      >
        <PriceContributionForm onClose={() => setShowPriceForm(false)} />
      </ContributionModal>

      <ContributionModal 
        isOpen={showSuggestionForm} 
        onClose={() => setShowSuggestionForm(false)}
      >
        <SuggestionForm onClose={() => setShowSuggestionForm(false)} />
      </ContributionModal>
    </div>
  );
};

export default ContributionSection;
