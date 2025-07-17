import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const HeroSection: React.FC = () => {
  const heroImages = [
    {
      src: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
      alt: "Comparação de preços em supermercado",
    },
    {
      src: "https://images.unsplash.com/photo-1591823969270-f087f50b1aff?q=80&w=415&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Pessoa fazendo compras inteligentes",
    },
    {
      src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      alt: "Economia nas compras do supermercado",
    },
    {
      src: "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
      alt: "Carrinho de compras em supermercado",
    },
  ];

  return (
    <div className="bg-app-gray dark:bg-gray-900 py-8 sm:py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-8 lg:mb-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-app-dark dark:text-white mb-4 sm:mb-6 text-center lg:text-left">
              Compare preços e economize nas compras
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 text-center lg:text-left px-4 lg:px-0">
              O Esperto Comparador ajuda você a encontrar os melhores preços em
              diferentes supermercados, economizando tempo e dinheiro em suas
              compras.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start px-4 lg:px-0">
              <Link to="/comparison">
                <Button className="bg-app-green hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg w-full sm:w-auto">
                  Comparar Agora
                </Button>
              </Link>
              <Link to="/reports">
                <Button
                  variant="outline"
                  className="border-app-blue text-app-blue hover:bg-blue-50 dark:hover:bg-blue-950 px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg w-full sm:w-auto dark:border-app-blue"
                >
                  Ver Relatórios
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:w-1/2 flex justify-center">
            <div className="w-full max-w-sm sm:max-w-md relative">
              <Carousel
                className="w-full"
                opts={{ align: "start", loop: true }}
              >
                <CarouselContent>
                  {heroImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-square rounded-lg overflow-hidden shadow-xl">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700" />
                <CarouselNext className="bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700" />
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
