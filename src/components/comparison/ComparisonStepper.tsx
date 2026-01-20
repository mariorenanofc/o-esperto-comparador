import React from "react";
import { Check, Store, Package, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComparisonStep = 1 | 2 | 3;

interface StepperProps {
  currentStep: ComparisonStep;
  storesCount: number;
  productsCount: number;
  hasResults: boolean;
}

const steps = [
  {
    id: 1,
    title: "Mercados",
    description: "Adicione os mercados",
    icon: Store,
  },
  {
    id: 2,
    title: "Produtos",
    description: "Liste os produtos e preços",
    icon: Package,
  },
  {
    id: 3,
    title: "Resultados",
    description: "Veja a melhor opção",
    icon: TrendingUp,
  },
];

export const ComparisonStepper: React.FC<StepperProps> = ({
  currentStep,
  storesCount,
  productsCount,
  hasResults,
}) => {
  const getStepStatus = (stepId: number) => {
    if (stepId === 1) {
      if (storesCount > 0) return "completed";
      return currentStep === 1 ? "current" : "upcoming";
    }
    if (stepId === 2) {
      if (productsCount > 0 && storesCount > 0) return "completed";
      if (storesCount > 0) return currentStep === 2 ? "current" : "upcoming";
      return "upcoming";
    }
    if (stepId === 3) {
      if (hasResults) return "completed";
      if (productsCount > 0 && storesCount > 0) return currentStep === 3 ? "current" : "upcoming";
      return "upcoming";
    }
    return "upcoming";
  };

  return (
    <div className="w-full mb-6 sm:mb-8">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-center">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                    status === "completed" &&
                      "bg-app-success border-app-success text-white",
                    status === "current" &&
                      "bg-gradient-to-br from-app-primary to-app-secondary border-app-primary text-white shadow-lg shadow-app-primary/30",
                    status === "upcoming" &&
                      "bg-muted border-border text-muted-foreground"
                  )}
                >
                  {status === "completed" ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Step Info */}
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",
                      status === "completed" && "text-app-success",
                      status === "current" && "text-foreground",
                      status === "upcoming" && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 hidden lg:block">
                    {step.description}
                  </p>
                </div>

                {/* Counter Badge */}
                {step.id === 1 && storesCount > 0 && (
                  <span className="mt-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-app-primary/10 text-app-primary">
                    {storesCount} {storesCount === 1 ? "mercado" : "mercados"}
                  </span>
                )}
                {step.id === 2 && productsCount > 0 && (
                  <span className="mt-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-app-secondary/10 text-app-secondary">
                    {productsCount} {productsCount === 1 ? "produto" : "produtos"}
                  </span>
                )}
                {step.id === 3 && hasResults && (
                  <span className="mt-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-app-success/10 text-app-success">
                    Pronto!
                  </span>
                )}
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 mx-4 h-0.5 max-w-24">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      getStepStatus(step.id) === "completed"
                        ? "bg-gradient-to-r from-app-success to-app-success"
                        : "bg-border"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Stepper - Compact */}
      <div className="flex md:hidden items-center justify-between px-2">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                {/* Step Circle - Smaller on mobile */}
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                    status === "completed" &&
                      "bg-app-success border-app-success text-white",
                    status === "current" &&
                      "bg-gradient-to-br from-app-primary to-app-secondary border-app-primary text-white shadow-lg shadow-app-primary/30",
                    status === "upcoming" &&
                      "bg-muted border-border text-muted-foreground"
                  )}
                >
                  {status === "completed" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Step Title Only */}
                <p
                  className={cn(
                    "text-xs font-medium mt-1 transition-colors",
                    status === "completed" && "text-app-success",
                    status === "current" && "text-foreground",
                    status === "upcoming" && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>

                {/* Small count indicator */}
                {step.id === 1 && storesCount > 0 && (
                  <span className="text-[10px] text-app-primary font-medium">
                    ({storesCount})
                  </span>
                )}
                {step.id === 2 && productsCount > 0 && (
                  <span className="text-[10px] text-app-secondary font-medium">
                    ({productsCount})
                  </span>
                )}
                {step.id === 3 && hasResults && (
                  <span className="text-[10px] text-app-success font-medium">
                    ✓
                  </span>
                )}
              </div>

              {/* Connector Line - Mobile */}
              {!isLast && (
                <div className="flex-1 mx-2 h-0.5">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      getStepStatus(step.id) === "completed"
                        ? "bg-app-success"
                        : "bg-border"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonStepper;
