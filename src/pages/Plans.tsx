import React from "react";
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
import { Check, Star } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionExpiryAlert } from "@/components/SubscriptionExpiryAlert";

const Plans: React.FC = () => {
  const { currentPlan, createCheckout, isLoading } = useSubscription();
  const { profile } = useAuth();

  const isAdmin = profile?.plan === "admin";
  
  const handleSelectPlan = (planId: any) => {
    if (planId === "free") return;
    
    // Prevenir downgrade para usuários PRO
    if (currentPlan === "pro" && (planId === "premium" || planId === "free")) {
      return;
    }
    
    createCheckout(planId);
  };

  const getButtonText = (plan: any) => {
    if (isAdmin) {
      return "👑 Acesso Admin";
    }
    
    if (currentPlan === plan.id) {
      return "✅ Plano Atual";
    }
    
    // Prevenir downgrade para usuários PRO
    if (currentPlan === "pro" && (plan.id === "premium" || plan.id === "free")) {
      return "🔒 Downgrade Bloqueado";
    }
    
    if (plan.id === "free") {
      return "🆓 Gratuito";
    }
    
    return `🚀 Escolher ${plan.name}`;
  };

  const isButtonDisabled = (plan: any) => {
    if (isAdmin) return true;
    if (isLoading) return true;
    if (currentPlan === plan.id) return true;
    
    // Bloquear downgrade para usuários PRO
    if (currentPlan === "pro" && (plan.id === "premium" || plan.id === "free")) {
      return true;
    }
    
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
      <Navbar />

      <div className="container mx-auto py-12 px-6">
        {/* Alerta de Expiração */}
        <SubscriptionExpiryAlert />
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            ✨ Escolha o Plano Ideal ✨
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Economize mais com as ferramentas certas. Todos os planos incluem
            acesso às ofertas do dia e comparação básica de preços.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto justify-items-center pt-8">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`group relative w-full max-w-sm overflow-visible transition-all duration-500 hover:scale-105 hover:-rotate-1 ${
                plan.popular
                  ? "border-emerald-400 border-2 shadow-2xl bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-emerald-900/20 dark:via-gray-800 dark:to-green-900/20 transform scale-110 z-10"
                  : "border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white via-slate-50 to-gray-50 dark:from-gray-800 dark:via-gray-700 dark:to-slate-800"
              } ${currentPlan === plan.id ? "ring-4 ring-blue-400/50 shadow-xl" : ""}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-indigo-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg animate-pulse text-white font-bold px-4 py-1 text-sm z-30">
                  <Star className="w-4 h-4 mr-2" />
                  Mais Popular
                </Badge>
              )}

              {currentPlan === plan.id && (
                <Badge className="absolute -top-3 right-4 bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg text-white font-bold px-3 py-1 text-sm z-30">
                  ✅ Seu Plano
                </Badge>
              )}

              <CardHeader className="text-center relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl font-bold">
                    {plan.id === 'free' ? '🆓' : plan.id === 'premium' ? '🥉' : plan.id === 'pro' ? '🥈' : '🥇'}
                  </span>
                </div>
                <CardTitle className="text-2xl font-bold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                <div className="mt-6">
                  <span className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    R$ {plan.price.toFixed(2).replace(".", ",")}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground ml-1">/mês</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 relative z-10">
                {plan.features.map((feature, index) => (
                  <div key={index} className="group/item flex items-start space-x-3 p-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20">
                    <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-300">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium group-hover/item:text-emerald-700 dark:group-hover/item:text-emerald-400 transition-colors duration-300">{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="relative z-10">
                <Button
                  className={`w-full font-semibold transition-all duration-300 ${
                    plan.popular 
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl" 
                      : currentPlan === plan.id
                      ? "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                      : ""
                  }`}
                  variant={
                    currentPlan === plan.id
                      ? "default"
                      : plan.popular
                      ? "default"
                      : "outline"
                  }
                  disabled={isButtonDisabled(plan)}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {getButtonText(plan)}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            💡 Perguntas Frequentes
          </h2>
          <div className="max-w-4xl mx-auto space-y-6 text-left">
            <div className="group bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-gray-800 dark:via-gray-700 dark:to-blue-900/20 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200 dark:border-slate-600 hover:scale-105">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold">❓</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    Posso cancelar a qualquer momento?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Sim! Você pode cancelar sua assinatura a qualquer momento sem
                    taxas de cancelamento. Sua assinatura permanecerá ativa até o final do período pago.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-white via-slate-50 to-emerald-50 dark:from-gray-800 dark:via-gray-700 dark:to-emerald-900/20 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200 dark:border-slate-600 hover:scale-105">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold">⏰</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                    Como funciona o período de teste?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Oferecemos 7 dias gratuitos para você testar todas as
                    funcionalidades premium sem compromisso.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-white via-slate-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-purple-900/20 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200 dark:border-slate-600 hover:scale-105">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold">⬆️</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                    Posso fazer upgrade do meu plano?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Claro! Você pode fazer upgrade ou downgrade do seu plano a
                    qualquer momento. As alterações entram em vigor imediatamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
