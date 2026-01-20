import React from "react";
import { DailyOffersSkeleton } from "@/components/skeletons/HomePageSkeletons";

const LoadingState: React.FC = () => {
  return <DailyOffersSkeleton />;
};

export default LoadingState;
