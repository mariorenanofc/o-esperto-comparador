import React from "react";
import { DailyOffer } from "@/lib/types";
import OfferCard from "./OfferCard";

interface OffersGridProps {
  visibleOffers: DailyOffer[];
  displayOffers: DailyOffer[];
  isSignedIn: boolean; // Prop que vem de DailyOffersSection
  isFreePlanLoggedIn: boolean;
  maxDailyOffersVisible: number;
  showAllForGuest: boolean; // Prop que vem de DailyOffersSection
}

const OffersGrid: React.FC<OffersGridProps> = ({
  visibleOffers,
  displayOffers,
  isSignedIn, // Uso da prop
  isFreePlanLoggedIn,
  maxDailyOffersVisible,
  showAllForGuest, // Uso da prop
}) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
      {displayOffers.map((offer, index) => {
        const isBlurred =
          (!isSignedIn && index >= 3 && !showAllForGuest) || // Uso das props
          (isFreePlanLoggedIn && index >= maxDailyOffersVisible);

        return (
          <OfferCard
            key={offer.id}
            offer={offer}
            index={index}
            isSignedIn={isSignedIn} // Passa a prop para OfferCard
            isBlurred={isBlurred}
            showAll={true}
          />
        );
      })}
    </div>
  );
};

export default OffersGrid;
