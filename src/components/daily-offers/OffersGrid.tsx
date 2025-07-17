import React from "react";
import { DailyOffer } from "@/lib/types";
import OfferCard from "./OfferCard";
import LoginOverlay from "./LoginOverlay";

interface OffersGridProps {
  visibleOffers: DailyOffer[];
  displayOffers: DailyOffer[];
  isSignedIn: boolean;
  showAll: boolean;
  onShowAll: () => void;
}

const OffersGrid: React.FC<OffersGridProps> = ({
  visibleOffers,
  displayOffers,
  isSignedIn,
  showAll,
  onShowAll,
}) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
      {visibleOffers.map((offer, index) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          index={index}
          isSignedIn={isSignedIn}
          showAll={showAll}
          isBlurred={!isSignedIn && index >= 3 && !showAll}
        />
      ))}

      {/* Overlay de blur para usuários não logados */}
      {!isSignedIn && !showAll && displayOffers.length > 3 && (
        <LoginOverlay
          totalOffers={displayOffers.length}
          onShowAll={onShowAll}
        />
      )}
    </div>
  );
};

export default OffersGrid;
