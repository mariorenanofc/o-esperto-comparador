import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, MessageSquare, Share2, Users } from "lucide-react";
import PriceContributionForm from "./PriceContributionForm";
import SuggestionForm from "./SuggestionForm";
import ContributionModal from "./ContributionModal";
import { useContributionActions } from "@/hooks/useContributionActions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const ContributionSection: React.FC = () => {
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const { handleShareApp, handleStartContributing } = useContributionActions();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Contribuir com Preços */}
        <Card className="hover:shadow-lg transition-shadow border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Compartilhar Preços</CardTitle>
                <CardDescription className="text-xs">
                  Ajude a comunidade com preços atualizados
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Compartilhe preços de produtos que você encontrou. Sua contribuição ajuda outros a economizar.
            </p>
            <Button
              onClick={() => setShowPriceForm(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Compartilhar Preço
            </Button>
          </CardContent>
        </Card>

        {/* Enviar Sugestões */}
        <Card className="hover:shadow-lg transition-shadow border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Enviar Sugestão</CardTitle>
                <CardDescription className="text-xs">
                  Sugira melhorias ou reporte problemas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Tem uma ideia para melhorar a plataforma? Encontrou algum problema? Envie sua sugestão.
            </p>
            <Button
              onClick={() => setShowSuggestionForm(true)}
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Enviar Sugestão
            </Button>
          </CardContent>
        </Card>

        {/* Compartilhar App */}
        <Card className="hover:shadow-lg transition-shadow border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Share2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Compartilhar App</CardTitle>
                <CardDescription className="text-xs">Indique nosso app para amigos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Conhece alguém que gostaria de economizar? Compartilhe nosso app e ajude mais pessoas.
            </p>
            <Button
              onClick={handleShareApp}
              className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar App
            </Button>
          </CardContent>
        </Card>

        {/* Participar da Comunidade */}
        <Card className="hover:shadow-lg transition-shadow border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Comunidade</CardTitle>
                <CardDescription className="text-xs">
                  Entre no nosso grupo do WhatsApp
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Faça parte da nossa comunidade! Receba dicas e converse com outros usuários.
            </p>
            <Button
              onClick={handleStartContributing}
              className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
            >
              <Users className="mr-2 h-4 w-4" />
              Entrar no Grupo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Por que contribuir - Colapsável */}
      <Accordion type="single" collapsible>
        <AccordionItem value="why-contribute" className="border rounded-lg bg-card">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="text-sm font-medium">💡 Por que contribuir?</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-foreground mb-2">🎯 Compartilhar Preços</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Ajuda outros usuários a economizar</li>
                  <li>• Mantém nossa base de dados atualizada</li>
                  <li>• Fortalece a comunidade</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">💡 Enviar Sugestões</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Nos ajuda a melhorar a plataforma</li>
                  <li>• Sua opinião é importante</li>
                  <li>• Contribui para novas funcionalidades</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
