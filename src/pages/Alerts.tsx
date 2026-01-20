import React from "react";
import Navbar from "@/components/Navbar";
import { PriceAlertsList } from "@/components/alerts/PriceAlertsList";
import { CreatePriceAlertDialog } from "@/components/alerts/CreatePriceAlertDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Bell, Plus, Target, Zap, TrendingDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const Alerts: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 dark:from-background dark:via-muted/10 dark:to-accent/5">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header com gradiente */}
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-hero-primary to-hero-accent text-white mb-4 shadow-lg">
              <Bell className="w-7 h-7" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-hero-primary via-hero-accent to-hero-success bg-clip-text text-transparent mb-2">
              Alertas de Preço
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              Seja notificado quando os preços dos produtos baixarem
            </p>
            <CreatePriceAlertDialog
              trigger={
                <Button className="bg-gradient-to-r from-hero-primary to-hero-accent text-white hover:opacity-90 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Alerta
                </Button>
              }
            />
          </div>

          {/* Como funciona - Colapsável */}
          <Accordion type="single" collapsible className="mb-6">
            <AccordionItem value="how-it-works" className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Info className="w-4 h-4 text-primary" />
                  Como funcionam os alertas?
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white mb-2">
                      <Target className="w-5 h-5" />
                    </div>
                    <h4 className="font-medium text-sm mb-1">1. Defina o Alvo</h4>
                    <p className="text-xs text-muted-foreground">Escolha o produto e o preço desejado</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white mb-2">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                    <h4 className="font-medium text-sm mb-1">2. Monitoramos</h4>
                    <p className="text-xs text-muted-foreground">Acompanhamos os preços automaticamente</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white mb-2">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h4 className="font-medium text-sm mb-1">3. Notificamos</h4>
                    <p className="text-xs text-muted-foreground">Você recebe um aviso quando baixar</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Lista de Alertas */}
          <PriceAlertsList />
        </div>
      </div>
    </div>
  );
};

export default Alerts;
