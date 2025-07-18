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
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import { getPlanById } from "@/lib/plans";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import ContributeCallToAction from "./daily-offers/ContributeCallToAction";

const DailyOffersSection: React.FC = () => {
  const { user, loading: authLoading, profile } = useAuth();
  const { currentPlan } = useSubscription();
  const { city, state } = useGeolocation();
  const [offers, setOffers] = useState<DailyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllForGuest, setShowAllForGuest] = useState(false);

  // REMOVIDO: const isSignedIn = !!user; <-- Não existe mais aqui

  const fetchOffers = useCallback(async () => {
    if (authLoading) return;

    try {
      console.log("Fetching daily offers for location:", { city, state });
      setLoading(true);
      setError(null);

      const fetchedOffers = await dailyOffersService.getTodaysOffers();

      let filteredOffers = fetchedOffers;
      if (city && state) {
        filteredOffers = fetchedOffers.filter(
          (offer) =>
            offer.city.toLowerCase() === city.toLowerCase() &&
            offer.state.toLowerCase() === state.toLowerCase()
        );
      }

      setOffers(filteredOffers);

      if (filteredOffers.length === 0) {
        console.log(
          "No offers found for current location in the last 24 hours"
        );
      }
    } catch (error) {
      console.error("Error fetching daily offers:", error);
      setError("Erro ao carregar ofertas do dia");
      toast.error("Erro ao carregar ofertas do dia");
    } finally {
      setLoading(false);
    }
  }, [authLoading, city, state]);

  useEffect(() => {
    fetchOffers();

    const interval = setInterval(() => {
      console.log("Auto-refreshing offers...");
      fetchOffers();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [fetchOffers]);

  const handleShowAllForGuest = () => {
    setShowAllForGuest(true);
  };

  const handleRefresh = () => {
    fetchOffers();
    toast.success("Ofertas atualizadas!");
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

  // --- ESTA É A NOVA DECLARAÇÃO E USO CONSISTENTE ---
  const currentUserIsSignedIn = !!user; // Usamos este nome agora
  const planDetails = getPlanById(currentPlan);
  const maxDailyOffersVisibleByPlan =
    currentUserIsSignedIn && planDetails.limitations.dailyOffersVisible !== -1
      ? planDetails.limitations.dailyOffersVisible || 0
      : Infinity;

  const guestVisibleLimit = 3;

  const totalOffersAvailable = offers.length;
  let offersToDisplayInGrid: DailyOffer[] = [];
  let showLoginOverlayForGuests = false;
  let showUpgradeOverlayForFreeUser = false;
  const offersBlurredForFree = Math.max(
    0,
    offers.length - maxDailyOffersVisibleByPlan
  );

  if (!currentUserIsSignedIn) {
    // Uso do novo nome
    offersToDisplayInGrid = showAllForGuest
      ? offers
      : offers.slice(0, guestVisibleLimit);
    showLoginOverlayForGuests =
      !showAllForGuest && offers.length > guestVisibleLimit;
  } else if (currentPlan === "free") {
    offersToDisplayInGrid = offers.slice(0, maxDailyOffersVisibleByPlan);
    showUpgradeOverlayForFreeUser = offersBlurredForFree > 0;
  } else {
    offersToDisplayInGrid = offers;
  }
  // --- FIM DA CONSISTÊNCIA ---

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 relative">
      <DailyOffersHeader
        city={city}
        actualOffersCount={offers.length}
        onRefresh={handleRefresh}
      />

      {offers.length > 0 ? (
        <OffersGrid
          visibleOffers={offersToDisplayInGrid}
          displayOffers={offers}
          isSignedIn={currentUserIsSignedIn} // Passa o novo nome como prop
          isFreePlanLoggedIn={currentUserIsSignedIn && currentPlan === "free"} // Usa o novo nome aqui
          maxDailyOffersVisible={maxDailyOffersVisibleByPlan}
          showAllForGuest={showAllForGuest}
        />
      ) : (
        <ContributeCallToAction />
      )}

      {showLoginOverlayForGuests && (
        <LoginOverlay
          totalOffers={totalOffersAvailable}
          onShowAll={handleShowAllForGuest}
        />
      )}

      {showUpgradeOverlayForFreeUser && (
        <div className="absolute inset-0 flex items-end justify-center pb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center shadow-lg max-w-md">
            <h3 className="text-lg font-semibold mb-2 text-app-blue">
              Desbloqueie Todas as Ofertas!
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Seu plano Gratuito exibe apenas {maxDailyOffersVisibleByPlan} de{" "}
              {totalOffersAvailable} ofertas diárias. Existem **mais{" "}
              {offersBlurredForFree}** ofertas disponíveis! Faça upgrade para
              ver todas e economizar ainda mais!
            </p>
            <div className="space-y-2">
              <Link to="/plans">
                <Button className="w-full bg-app-green hover:bg-green-600">
                  Ver Planos e Fazer Upgrade
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyOffersSection;
