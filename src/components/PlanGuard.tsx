import React, { useState } from "react";
import { usePlanValidation } from "@/hooks/usePlanValidation";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { PlanTier } from "@/lib/plans";

interface PlanGuardProps {
  feature: string;
  currentUsage?: number;
  suggestedPlan?: PlanTier;
  fallbackMessage?: string;
  children: React.ReactNode;
  onFeatureBlocked?: () => void;
}

export const PlanGuard: React.FC<PlanGuardProps> = ({
  feature,
  currentUsage = 0,
  suggestedPlan = "premium",
  fallbackMessage,
  children,
  onFeatureBlocked
}) => {
  const { canUseFeature, currentPlan } = usePlanValidation();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const hasAccess = canUseFeature(feature, currentUsage);

  if (!hasAccess) {
    if (onFeatureBlocked) {
      onFeatureBlocked();
    }

    if (fallbackMessage) {
      return (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200">{fallbackMessage}</p>
          <button
            onClick={() => setShowUpgradePrompt(true)}
            className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 underline hover:no-underline"
          >
            Fazer upgrade do plano
          </button>
          <UpgradePrompt
            isOpen={showUpgradePrompt}
            onClose={() => setShowUpgradePrompt(false)}
            feature={feature}
            suggestedPlan={suggestedPlan}
          />
        </div>
      );
    }

    return (
      <>
        <div
          onClick={() => setShowUpgradePrompt(true)}
          className="cursor-pointer opacity-50 hover:opacity-75 transition-opacity"
        >
          {children}
        </div>
        <UpgradePrompt
          isOpen={showUpgradePrompt}
          onClose={() => setShowUpgradePrompt(false)}
          feature={feature}
          suggestedPlan={suggestedPlan}
        />
      </>
    );
  }

  return <>{children}</>;
};