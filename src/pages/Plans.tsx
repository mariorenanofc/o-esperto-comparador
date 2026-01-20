import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Star, HelpCircle, LogIn } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionExpiryAlert } from "@/components/SubscriptionExpiryAlert";

const Plans: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlan, createCheckout, isLoading } = useSubscription();
  const { profile, user } = useAuth();

  const isLoggedIn = !!user;
  const isAdmin = profile?.plan === "admin";
  
  const handleSelectPlan = (planId: any) => {
    // If not logged in, redirect to signup
    if (!isLoggedIn) {
      navigate('/signup');
      return;
    }
    if (planId === "free") return;
    if (currentPlan === "pro" && (planId === "premium" || planId === "free")) return;
    createCheckout(planId);
  };

  const getButtonText = (plan: any) => {
    if (!isLoggedIn) {
      return plan.id === 'free' ? '🆓 Começar Grátis' : `🚀 Assinar ${plan.name}`;
    }
    if (isAdmin) return "👑 Acesso Admin";
    if (currentPlan === plan.id) return "✅ Plano Atual";
    if (currentPlan === "pro" && (plan.id === "premium" || plan.id === "free")) return "🔒 Bloqueado";
    if (plan.id === "free") return "🆓 Gratuito";
    return `🚀 Escolher ${plan.name}`;
  };

  const isButtonDisabled = (plan: any) => {
    if (!isLoggedIn) return false; // Allow clicking to redirect
    if (isAdmin) return true;
    if (isLoading) return true;
    if (currentPlan === plan.id) return true;
    if (currentPlan === "pro" && (plan.id === "premium" || plan.id === "free")) return true;
    return false;
  };

  const faqs = [
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas de cancelamento. Sua assinatura permanecerá ativa até o final do período pago."
    },
    {
      question: "Como funciona o período de teste?",
      answer: "Oferecemos 7 dias gratuitos para você testar todas as funcionalidades premium sem compromisso."
    },
    {
      question: "Posso fazer upgrade do meu plano?",
      answer: "Claro! Você pode fazer upgrade do seu plano a qualquer momento. As alterações entram em vigor imediatamente."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Navbar />

      <div className="container mx-auto py-8 md:py-12 px-4 md:px-6">
        {isLoggedIn && <SubscriptionExpiryAlert />}
        
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-hero-primary via-primary to-hero-accent bg-clip-text text-transparent mb-4">
            ✨ Escolha o Plano Ideal
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Economize mais com as ferramentas certas. Todos os planos incluem acesso às ofertas do dia.
          </p>
          {!isLoggedIn && (
            <p className="text-sm text-muted-foreground mt-2">
              <LogIn className="w-4 h-4 inline mr-1" aria-hidden="true" />
              Crie sua conta gratuitamente para começar
            </p>
          )}
        </div>

        {/* Cards de Planos - Tamanhos uniformes */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "border-primary border-2 shadow-lg bg-gradient-to-br from-primary/5 via-background to-primary/10"
                  : "border-border hover:border-primary/50"
              } ${currentPlan === plan.id ? "ring-2 ring-primary/50" : ""}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground font-medium px-3 py-1 text-xs">
                  <Star className="w-3 h-3 mr-1" aria-hidden="true" />
                  Popular
                </Badge>
              )}

              {currentPlan === plan.id && (
                <Badge className="absolute -top-3 right-4 bg-secondary text-secondary-foreground text-xs px-2 py-1">
                  Atual
                </Badge>
              )}

              <CardHeader className="text-center pt-6 pb-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-hero-primary to-hero-accent rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl" aria-hidden="true">
                    {plan.id === 'free' ? '🆓' : plan.id === 'premium' ? '⭐' : '🚀'}
                  </span>
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-foreground">
                    R$ {plan.price.toFixed(2).replace(".", ",")}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground text-sm">/mês</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-2 px-5">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" aria-hidden="true" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="pt-4 pb-6">
                <Button
                  className={`w-full ${
                    plan.popular 
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                      : currentPlan === plan.id
                      ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                      : ""
                  }`}
                  variant={currentPlan === plan.id || plan.popular ? "default" : "outline"}
                  disabled={isButtonDisabled(plan)}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {getButtonText(plan)}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQs com Accordion */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-center flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Perguntas Frequentes
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`faq-${index}`}
                className="border rounded-lg px-4 bg-card"
              >
                <AccordionTrigger className="hover:no-underline py-3 text-left text-sm font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default Plans;
