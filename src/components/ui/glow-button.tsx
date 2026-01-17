import React from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

interface GlowButtonProps extends ButtonProps {
  glowColor?: "primary" | "success" | "warning" | "accent";
  glowIntensity?: "low" | "medium" | "high";
}

const glowColors = {
  primary: "from-hero-primary to-hero-accent",
  success: "from-green-500 to-emerald-500",
  warning: "from-orange-500 to-amber-500",
  accent: "from-purple-500 to-pink-500",
};

const glowIntensities = {
  low: "opacity-20 group-hover:opacity-30",
  medium: "opacity-30 group-hover:opacity-50",
  high: "opacity-40 group-hover:opacity-60",
};

export const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  className,
  glowColor = "primary",
  glowIntensity = "medium",
  ...props
}) => {
  return (
    <div className="relative group inline-block">
      {/* Glow effect */}
      <div
        className={cn(
          "absolute -inset-1 bg-gradient-to-r rounded-lg blur transition-opacity duration-300",
          glowColors[glowColor],
          glowIntensities[glowIntensity]
        )}
      />

      {/* Button */}
      <Button
        className={cn(
          "relative bg-gradient-to-r text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
          glowColors[glowColor],
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </div>
  );
};

export default GlowButton;
