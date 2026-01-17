import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HeroSearchInput from "@/components/hero/HeroSearchInput";
import TrendingProducts from "@/components/hero/TrendingProducts";
import SavingsCounter from "@/components/hero/SavingsCounter";

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden hero-gradient-bg">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-hero-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-hero-accent/10 rounded-full blur-3xl animate-float animate-delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-hero-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-hero-primary/10 border border-hero-primary/20 mb-8 animate-fade-in-down">
            <Sparkles className="w-4 h-4 text-hero-primary" />
            <span className="text-sm font-medium text-hero-primary">
              Compare preços e economize até 40%
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 animate-fade-in-up leading-tight">
            <span className="text-foreground">Encontre o </span>
            <span className="text-gradient-hero">melhor preço</span>
            <br />
            <span className="text-foreground">para suas compras</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up animate-delay-100">
            Compare preços de produtos em diferentes supermercados da sua região 
            e descubra onde economizar mais. Rápido, fácil e gratuito.
          </p>

          {/* Search Input */}
          <div className="animate-fade-in-up animate-delay-200">
            <HeroSearchInput />
          </div>

          {/* Trending Products */}
          <div className="animate-fade-in-up animate-delay-300">
            <TrendingProducts />
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 animate-fade-in-up animate-delay-400">
            <Link to="/contribute">
              <Button
                variant="outline"
                size="lg"
                className="group border-hero-primary/30 text-hero-primary hover:bg-hero-primary/10 hover:border-hero-primary/50"
              >
                Contribuir com preços
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/reports">
              <Button
                variant="ghost"
                size="lg"
                className="text-muted-foreground hover:text-foreground"
              >
                Ver relatórios de economia
              </Button>
            </Link>
          </div>

          {/* Stats Counter */}
          <div className="animate-fade-in-up animate-delay-500">
            <SavingsCounter />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
