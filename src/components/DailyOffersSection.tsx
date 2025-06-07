
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGeolocation } from "@/hooks/useGeolocation";
import { DailyOffer } from "@/lib/types";
import { supabaseDailyOffersService } from "@/services/supabase/dailyOffersService";
import DailyOffersHeader from "./daily-offers/DailyOffersHeader";
import OffersGrid from "./daily-offers/OffersGrid";
import ContributeCallToAction from "./daily-offers/ContributeCallToAction";
import LoadingState from "./daily-offers/LoadingState";

interface DailyOffersSectionProps {
  offers?: DailyOffer[];
}

const DailyOffersSection: React.FC<DailyOffersSectionProps> = ({ offers = [] }) => {
  const { user } = useAuth();
  const { city } = useGeolocation();
  const [showAll, setShowAll] = useState(false);
  const [visibleOffers, setVisibleOffers] = useState<DailyOffer[]>([]);
  const [actualOffers, setActualOffers] = useState<DailyOffer[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data para demonstração (usado quando não há ofertas reais)
  const mockOffers: DailyOffer[] = [
    {
      id: "1",
      productName: "Arroz Tipo 1 5kg",
      price: 18.90,
      storeName: "Supermercado Econômico",
      city: "Trindade",
      state: "PE",
      contributorName: "João S.",
      userId: "mock_user_1",
      timestamp: new Date(),
      verified: true
    },
    {
      id: "2", 
      productName: "Óleo de Soja 900ml",
      price: 4.50,
      storeName: "Mercadinho da Esquina",
      city: "Trindade",
      state: "PE",
      contributorName: "Maria L.",
      userId: "mock_user_2",
      timestamp: new Date(),
      verified: false
    },
    {
      id: "3",
      productName: "Açúcar Cristal 1kg",
      price: 3.80,
      storeName: "Atacadão Central",
      city: "Trindade", 
      state: "PE",
      contributorName: "Pedro M.",
      userId: "mock_user_3",
      timestamp: new Date(),
      verified: true
    },
    {
      id: "4",
      productName: "Feijão Carioca 1kg",
      price: 7.20,
      storeName: "Supermercado Econômico",
      city: "Trindade",
      state: "PE", 
      contributorName: "Ana C.",
      userId: "mock_user_4",
      timestamp: new Date(),
      verified: false
    },
    {
      id: "5",
      productName: "Macarrão Espaguete 500g",
      price: 2.90,
      storeName: "Mercadinho da Esquina",
      city: "Trindade",
      state: "PE",
      contributorName: "Carlos R.",
      userId: "mock_user_5",
      timestamp: new Date(),
      verified: true
    }
  ];

  // Buscar ofertas reais do serviço
  const fetchOffers = async () => {
    try {
      setLoading(true);
      console.log('Fetching offers from Supabase...');
      const realOffers = await supabaseDailyOffersService.getTodaysOffers();
      console.log('Fetched real offers:', realOffers);
      setActualOffers(realOffers);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    
    // Refetch a cada 30 segundos para capturar mudanças em tempo real
    const interval = setInterval(fetchOffers, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Usar ofertas reais se existirem, senão usar mock data
  const displayOffers = actualOffers.length > 0 ? actualOffers : (offers.length > 0 ? offers : mockOffers);

  useEffect(() => {
    if (user || showAll) {
      setVisibleOffers(displayOffers);
    } else {
      setVisibleOffers(displayOffers.slice(0, 3));
    }
  }, [user, showAll, displayOffers]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-6">
        <DailyOffersHeader
          city={city}
          actualOffersCount={actualOffers.length}
          onRefresh={fetchOffers}
        />

        <OffersGrid
          visibleOffers={visibleOffers}
          displayOffers={displayOffers}
          isSignedIn={!!user}
          showAll={showAll}
          onShowAll={() => setShowAll(true)}
        />

        <ContributeCallToAction />
      </div>
    </section>
  );
};

export default DailyOffersSection;
