import React from "react";
import Navbar from "@/components/Navbar";
import { PriceAlertsList } from "@/components/alerts/PriceAlertsList";
import { CreatePriceAlertDialog } from "@/components/alerts/CreatePriceAlertDialog";
import { Bell, Plus } from "lucide-react";

const Alerts: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bell className="w-8 h-8 text-hero-primary" />
              Alertas de Preço
            </h1>
            <p className="text-muted-foreground mt-2">
              Seja notificado quando os preços dos produtos baixarem
            </p>
          </div>
          <CreatePriceAlertDialog
            trigger={
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-hero-primary to-hero-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                <Plus className="w-5 h-5" />
                Novo Alerta
              </button>
            }
          />
        </div>
        <PriceAlertsList />
      </div>
    </div>
  );
};

export default Alerts;
