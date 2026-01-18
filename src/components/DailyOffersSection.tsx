import React, { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGeolocation } from "@/hooks/useGeolocation";
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
import { useOptimizedDailyOffers } from "@/hooks/useOptimizedData";

const DailyOffersSection: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { currentPlan } = useSubscription();
  const { city, state, loading: geoLoading } = useGeolocation();
  const [showAllForGuest, setShowAllForGuest] = React.useState(false);

  // Usar React Query hook centralizado
  const { data: allOffers = [], isLoading: offersLoading, error: offersError, refetch } = useOptimizedDailyOffers();

  // Filtrar ofertas por localização usando useMemo
  const offers = useMemo(() => {
    if (!city || !state || geoLoading) return allOffers;
    return allOffers.filter(
      (offer) =>
        offer.city?.toLowerCase() === city.toLowerCase() &&
        offer.state?.toLowerCase() === state.toLowerCase()
    );
  }, [allOffers, city, state, geoLoading]);

  const loading = authLoading || offersLoading;

  const handleShowAllForGuest = () => {
    setShowAllForGuest(true);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Ofertas atualizadas!");
  };

  if (loading) {
    return <LoadingState />;
  }

  if (offersError) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Erro</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Erro ao carregar ofertas do dia</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </CardContent>
      </Card>
    );
  }

  const currentUserIsSignedIn = !!user;
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
          isSignedIn={currentUserIsSignedIn}
          isFreePlanLoggedIn={currentUserIsSignedIn && currentPlan === "free"}
          maxDailyOffersVisible={maxDailyOffersVisibleByPlan}
          showAllForGuest={showAllForGuest}
        />
      ) : (
        <div className="space-y-6">
          <Card className="w-full p-8 text-center bg-gradient-to-br from-blue-50 to-green-50 border-dashed border-2">
            <CardContent className="space-y-4">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-xl font-semibold text-gray-800">
                Nenhuma oferta encontrada para {city || "sua região"}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Seja o primeiro a compartilhar preços em sua cidade! Sua contribuição 
                ajuda outros consumidores a economizar.
              </p>
              <div className="mt-6 space-y-3">
                <Button 
                  onClick={handleRefresh}
                  variant="outline" 
                  className="mr-3"
                >
                  🔄 Verificar Novamente
                </Button>
                {currentUserIsSignedIn && (
                  <p className="text-sm text-gray-500">
                    💡 Contribua com preços e ganhe pontos na comunidade!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <ContributeCallToAction />
        </div>
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
