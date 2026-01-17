import React, { useState, useEffect, useRef } from "react";
import { TrendingDown, Users, ShoppingCart } from "lucide-react";

interface CounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

const AnimatedCounter: React.FC<CounterProps> = ({ 
  end, 
  duration = 2000, 
  prefix = "", 
  suffix = "" 
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, end, duration]);

  return (
    <div ref={ref} className="text-3xl sm:text-4xl lg:text-5xl font-bold">
      {prefix}
      {count.toLocaleString("pt-BR")}
      {suffix}
    </div>
  );
};

export const SavingsCounter: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12 max-w-4xl mx-auto">
      {/* Total Economy */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
        <div className="relative flex flex-col items-center p-6 bg-white/90 dark:bg-gray-900/90 rounded-xl border border-green-200 dark:border-green-800/50 backdrop-blur-sm">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
          <AnimatedCounter 
            end={125847} 
            prefix="R$ " 
            suffix="" 
          />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Economia total gerada
          </p>
        </div>
      </div>

      {/* Users */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
        <div className="relative flex flex-col items-center p-6 bg-white/90 dark:bg-gray-900/90 rounded-xl border border-blue-200 dark:border-blue-800/50 backdrop-blur-sm">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <AnimatedCounter 
            end={2847} 
            suffix="+" 
          />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Usuários economizando
          </p>
        </div>
      </div>

      {/* Comparisons */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
        <div className="relative flex flex-col items-center p-6 bg-white/90 dark:bg-gray-900/90 rounded-xl border border-purple-200 dark:border-purple-800/50 backdrop-blur-sm">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <AnimatedCounter 
            end={15420} 
            suffix="" 
          />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Comparações realizadas
          </p>
        </div>
      </div>
    </div>
  );
};

export default SavingsCounter;
