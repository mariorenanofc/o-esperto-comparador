import React from "react";
import Navbar from "@/components/Navbar";
import { SmartShoppingList } from "@/components/smart-list/SmartShoppingList";
import { ShoppingCart } from "lucide-react";

const SmartList: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-hero-primary" />
            Lista de Compras Inteligente
          </h1>
          <p className="text-muted-foreground mt-2">
            Adicione produtos e descubra onde comprar mais barato
          </p>
        </div>
        <SmartShoppingList />
      </div>
    </div>
  );
};

export default SmartList;
