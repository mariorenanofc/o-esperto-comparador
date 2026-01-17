import React from "react";
import { cn } from "@/lib/utils";

interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
  glowColor?: string;
  hover?: boolean;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  className,
  gradientFrom = "from-hero-primary",
  gradientTo = "to-hero-accent",
  glowColor = "hero-primary",
  hover = true,
}) => {
  return (
    <div className={cn("relative group", className)}>
      {/* Glow effect */}
      <div
        className={cn(
          "absolute -inset-0.5 bg-gradient-to-r rounded-2xl blur opacity-20 transition duration-500",
          gradientFrom,
          gradientTo,
          hover && "group-hover:opacity-40"
        )}
      />

      {/* Card content */}
      <div
        className={cn(
          "relative bg-white dark:bg-gray-900 rounded-xl border border-border/50 p-6 transition-all duration-300",
          hover && "group-hover:shadow-xl group-hover:border-hero-primary/30"
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default GradientCard;
