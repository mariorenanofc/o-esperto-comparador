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
import { motion } from "framer-motion";

const DailyOffersSection: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { currentPlan } = useSubscription();
  const { city, state, loading: geoLoading } = useGeolocation();
  const [showAllForGuest, setShowAllForGuest] = React.useState(false);

  // Usar React Query hook centralizado
  const { data: allOffers = [], isLoading: offersLoading, error: offersError, refetch } = useOptimizedDailyOffers();

  // Filtrar ofertas por localização usando useMemo
  // Se não houver localização disponível, mostrar todas as ofertas
  const offers = useMemo(() => {
    if (geoLoading) return [];
    if (!city || !state) return allOffers;
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
    <motion.div 
      className="w-full max-w-6xl mx-auto space-y-6 relative px-4 sm:px-6 py-8"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <DailyOffersHeader
        city={city}
        state={state}
        actualOffersCount={offers.length}
        onRefresh={handleRefresh}
      />

      {offers.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <OffersGrid
            visibleOffers={offersToDisplayInGrid}
            displayOffers={offers}
            isSignedIn={currentUserIsSignedIn}
            isFreePlanLoggedIn={currentUserIsSignedIn && currentPlan === "free"}
            maxDailyOffersVisible={maxDailyOffersVisibleByPlan}
            showAllForGuest={showAllForGuest}
          />
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="w-full p-8 text-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 border-dashed border-2">
            <CardContent className="space-y-4">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-xl font-semibold text-foreground">
                Nenhuma oferta encontrada para {city || "sua região"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
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
                  <p className="text-sm text-muted-foreground">
                    💡 Contribua com preços e ganhe pontos na comunidade!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <ContributeCallToAction />
        </motion.div>
      )}

      {showLoginOverlayForGuests && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LoginOverlay
            totalOffers={totalOffersAvailable}
            onShowAll={handleShowAllForGuest}
          />
        </motion.div>
      )}

      {showUpgradeOverlayForFreeUser && (
        <motion.div 
          className="absolute inset-0 flex items-end justify-center pb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-6 text-center shadow-lg max-w-md border">
            <h3 className="text-lg font-semibold mb-2 text-primary">
              Desbloqueie Todas as Ofertas!
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Seu plano Gratuito exibe apenas {maxDailyOffersVisibleByPlan} de{" "}
              {totalOffersAvailable} ofertas diárias. Existem **mais{" "}
              {offersBlurredForFree}** ofertas disponíveis! Faça upgrade para
              ver todas e economizar ainda mais!
            </p>
            <div className="space-y-2">
              <Link to="/plans">
                <Button className="w-full">
                  Ver Planos e Fazer Upgrade
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DailyOffersSection;
