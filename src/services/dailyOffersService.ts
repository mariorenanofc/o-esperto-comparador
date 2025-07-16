
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGeolocation } from "@/hooks/useGeolocation";
import { dailyOffersService } from "@/services/dailyOffersService";
import { DailyOffer } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DailyOffersHeader from "./daily-offers/DailyOffersHeader";
import LoadingState from "./daily-offers/LoadingState";
import LoginOverlay from "./daily-offers/LoginOverlay";
import OffersGrid from "./daily-offers/OffersGrid";
import ContributeCallToAction from "./daily-offers/ContributeCallToAction";
import { toast } from "sonner";

const DailyOffersSection: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { city, state } = useGeolocation();
  const [offers, setOffers] = useState<DailyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const fetchOffers = useCallback(async () => {
    if (authLoading) return;
    
    try {
      console.log('Fetching daily offers for location:', { city, state });
      setLoading(true);
      setError(null);
      
      // Buscar ofertas das últimas 24 horas
      const fetchedOffers = await dailyOffersService.getTodaysOffers();
      console.log('All fetched offers (last 24h):', fetchedOffers);
      
      // Filtrar ofertas por localização do usuário se disponível
      let filteredOffers = fetchedOffers;
      if (city && state) {
        filteredOffers = fetchedOffers.filter(offer => 
          offer.city.toLowerCase() === city.toLowerCase() && 
          offer.state.toLowerCase() === state.toLowerCase()
        );
        console.log('Filtered offers by location:', filteredOffers);
      }
      
      setOffers(filteredOffers);
      
      if (filteredOffers.length === 0) {
        console.log('No offers found for current location in the last 24 hours');
      }
    } catch (error) {
      console.error('Error fetching daily offers:', error);
      setError('Erro ao carregar ofertas do dia');
      toast.error('Erro ao carregar ofertas do dia');
    } finally {
      setLoading(false);
    }
  }, [authLoading, city, state]);

  // Atualizar ofertas automaticamente a cada 5 minutos
  useEffect(() => {
    fetchOffers();
    
    const interval = setInterval(() => {
      console.log('Auto-refreshing offers...');
      fetchOffers();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [fetchOffers]);

  const handleShowAll = () => {
    setShowAll(true);
  };

  const handleRefresh = () => {
    fetchOffers();
    toast.success('Ofertas atualizadas!');
  };

  if (authLoading || loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Erro</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <button 
            onClick={fetchOffers}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </CardContent>
      </Card>
    );
  }

  // Calcular ofertas visíveis
  const visibleOffers = user || showAll ? offers : offers.slice(0, 3);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 relative">
      <DailyOffersHeader 
        city={city}
        actualOffersCount={offers.length}
        onRefresh={handleRefresh}
      />
      
      {offers.length > 0 ? (
        <OffersGrid 
          visibleOffers={visibleOffers}
          displayOffers={offers}
          isSignedIn={!!user}
          showAll={showAll}
          onShowAll={handleShowAll}
        />
      ) : (
        <ContributeCallToAction />
      )}

      {!user && !showAll && offers.length > 3 && (
        <LoginOverlay 
          totalOffers={offers.length}
          onShowAll={handleShowAll}
        />
      )}
    </div>
  );
};

export default DailyOffersSection;
