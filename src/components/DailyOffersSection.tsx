
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingDown, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useGeolocation } from "@/hooks/useGeolocation";
import { DailyOffer } from "@/lib/types";

interface DailyOffersSectionProps {
  offers?: DailyOffer[];
}

const DailyOffersSection: React.FC<DailyOffersSectionProps> = ({ offers = [] }) => {
  const { isSignedIn } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [visibleOffers, setVisibleOffers] = useState<DailyOffer[]>([]);

  // Mock data para demonstração
  const mockOffers: DailyOffer[] = [
    {
      id: "1",
      productName: "Arroz Tipo 1 5kg",
      price: 18.90,
      storeName: "Supermercado Econômico",
      city: "Trindade",
      state: "PE",
      contributorName: "João S.",
      timestamp: new Date(),
      verified: true
    },
    {
      id: "2", 
      productName: "Óleo de Soja 900ml",
      price: 4.50,
      storeName: "Mercadinho da Esquina",
      city: "Trindade",
      state: "PE",
      contributorName: "Maria L.",
      timestamp: new Date(),
      verified: false
    },
    {
      id: "3",
      productName: "Açúcar Cristal 1kg",
      price: 3.80,
      storeName: "Atacadão Central",
      city: "Trindade", 
      state: "PE",
      contributorName: "Pedro M.",
      timestamp: new Date(),
      verified: true
    },
    {
      id: "4",
      productName: "Feijão Carioca 1kg",
      price: 7.20,
      storeName: "Supermercado Econômico",
      city: "Trindade",
      state: "PE", 
      contributorName: "Ana C.",
      timestamp: new Date(),
      verified: false
    },
    {
      id: "5",
      productName: "Macarrão Espaguete 500g",
      price: 2.90,
      storeName: "Mercadinho da Esquina",
      city: "Trindade",
      state: "PE",
      contributorName: "Carlos R.",
      timestamp: new Date(),
      verified: true
    }
  ];

  const displayOffers = offers.length > 0 ? offers : mockOffers;

  useEffect(() => {
    if (isSignedIn || showAll) {
      setVisibleOffers(displayOffers);
    } else {
      setVisibleOffers(displayOffers.slice(0, 3));
    }
  }, [isSignedIn, showAll, displayOffers]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <TrendingDown className="text-app-green mr-3" size={32} />
            <h2 className="text-3xl font-bold text-app-dark">
              🔥 Ofertas do Dia
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Preços compartilhados pela nossa comunidade hoje em <strong>Trindade, PE</strong>
          </p>
          <div className="flex items-center justify-center mt-3 text-sm text-orange-600">
            <AlertTriangle size={16} className="mr-2" />
            <span>
              Sempre confirme os preços no estabelecimento antes da compra
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {visibleOffers.map((offer, index) => (
            <Card 
              key={offer.id} 
              className={`hover:shadow-lg transition-all duration-300 border-l-4 ${
                offer.verified ? 'border-l-green-500' : 'border-l-orange-500'
              } ${
                !isSignedIn && index >= 3 && !showAll ? 'blur-sm pointer-events-none' : ''
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-tight">
                    {offer.productName}
                  </CardTitle>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    offer.verified 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {offer.verified ? '✓ Verificado' : 'Não verificado'}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-app-green">
                    {formatPrice(offer.price)}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="font-medium">{offer.storeName}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1" />
                      <span>{offer.city}, {offer.state}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Por: {offer.contributorName}</span>
                      <span>{formatTime(offer.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Overlay de blur para usuários não logados */}
          {!isSignedIn && !showAll && displayOffers.length > 3 && (
            <div className="absolute inset-0 flex items-end justify-center pb-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center shadow-lg max-w-md">
                <EyeOff className="mx-auto mb-3 text-app-blue" size={32} />
                <h3 className="text-lg font-semibold mb-2">
                  Veja Todas as Ofertas
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Faça login para ver todas as {displayOffers.length} ofertas do dia
                </p>
                <div className="space-y-2">
                  <Link to="/sign-in">
                    <Button className="w-full bg-app-green hover:bg-green-600">
                      Fazer Login
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowAll(true)}
                  >
                    <Eye size={16} className="mr-2" />
                    Dar uma Espiada
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call to action para contribuir */}
        <div className="text-center mt-12">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 inline-block">
            <p className="text-gray-600 mb-4">
              Encontrou um preço melhor? Compartilhe com a comunidade!
            </p>
            <Link to="/contribute">
              <Button className="bg-app-blue hover:bg-blue-600">
                Contribuir com Preços
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DailyOffersSection;
