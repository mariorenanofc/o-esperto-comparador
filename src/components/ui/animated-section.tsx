import React from "react";
import { motion, Variants } from "framer-motion";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

const getVariants = (direction: AnimatedSectionProps["direction"]): Variants => {
  const distance = 40;
  
  const initialPosition = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  return {
    hidden: {
      opacity: 0,
      ...initialPosition[direction || "up"],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  };
};

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      variants={getVariants(direction)}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Componente para itens em lista com stagger
interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  className = "",
  staggerDelay = 0.1,
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedListItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
