
import React from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { useSubscription } from "@/hooks/useSubscription";

const Plans: React.FC = () => {
  const { currentPlan, createCheckout, isLoading } = useSubscription();

  const handleSelectPlan = (planId: any) => {
    if (planId === 'free') return;
    createCheckout(planId);
  };

  return (
    <div className="min-h-screen bg-app-gray">
      <Navbar />
      
      <div className="container mx-auto py-8 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Escolha o Plano Ideal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Economize mais com as ferramentas certas. Todos os planos incluem 
            acesso às ofertas do dia e comparação básica de preços.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {PLANS.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${
                plan.popular ? 'border-green-500 border-2 shadow-lg scale-105' : ''
              } ${currentPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500">
                  <Star className="w-3 h-3 mr-1" />
                  Mais Popular
                </Badge>
              )}
              
              {currentPlan === plan.id && (
                <Badge className="absolute -top-3 right-4 bg-blue-500">
                  Seu Plano
                </Badge>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    R$ {plan.price.toFixed(2).replace('.', ',')}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500">/mês</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={currentPlan === plan.id ? "outline" : plan.popular ? "default" : "outline"}
                  disabled={isLoading || currentPlan === plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {currentPlan === plan.id 
                    ? "Plano Atual" 
                    : plan.id === 'free' 
                      ? "Gratuito" 
                      : `Escolher ${plan.name}`
                  }
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Perguntas Frequentes</h2>
          <div className="max-w-3xl mx-auto space-y-6 text-left">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-gray-600">
                Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas de cancelamento.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Como funciona o período de teste?</h3>
              <p className="text-gray-600">
                Oferecemos 7 dias gratuitos para você testar todas as funcionalidades premium.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Posso fazer upgrade do meu plano?</h3>
              <p className="text-gray-600">
                Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
