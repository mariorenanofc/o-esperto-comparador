
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingDown, Eye, EyeOff, AlertTriangle, RefreshCw } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useGeolocation } from "@/hooks/useGeolocation";
import { DailyOffer } from "@/lib/types";
import { dailyOffersService } from "@/services/dailyOffersService";

interface DailyOffersSectionProps {
  offers?: DailyOffer[];
}

const DailyOffersSection: React.FC<DailyOffersSectionProps> = ({ offers = [] }) => {
  const { isSignedIn } = useAuth();
  const { city } = useGeolocation();
  const [showAll, setShowAll] = useState(false);
  const [visibleOffers, setVisibleOffers] = useState<DailyOffer[]>([]);
  const [actualOffers, setActualOffers] = useState<DailyOffer[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar ofertas reais do serviço
  const fetchOffers = async () => {
    try {
      setLoading(true);
      console.log('Fetching offers from service...');
      const realOffers = await dailyOffersService.getTodaysOffers();
      console.log('Fetched real offers:', realOffers);
      setActualOffers(realOffers);
      
      // Debug: verificar todas as ofertas na memória
      const allOffers = dailyOffersService.debugGetAllOffers();
      console.log('All offers in memory (debug):', allOffers);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    
    // Refetch a cada 30 segundos para capturar novas contribuições
    const interval = setInterval(fetchOffers, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Mock data para demonstração (usado quando não há ofertas reais)
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

  // Usar ofertas reais se existirem, senão usar mock data
  const displayOffers = actualOffers.length > 0 ? actualOffers : (offers.length > 0 ? offers : mockOffers);

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

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    fetchOffers();
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-app-dark mb-4">
              🔥 Ofertas do Dia
            </h2>
            <p className="text-lg text-gray-600">Carregando ofertas...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <TrendingDown className="text-app-green mr-3" size={32} />
            <h2 className="text-3xl font-bold text-app-dark">
              🔥 Ofertas do Dia
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="ml-4"
              title="Atualizar ofertas"
            >
              <RefreshCw size={16} />
            </Button>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Preços compartilhados pela nossa comunidade hoje em <strong>{city || "Trindade"}, PE</strong>
          </p>
          <div className="flex items-center justify-center mt-3 text-sm text-orange-600">
            <AlertTriangle size={16} className="mr-2" />
            <span>
              Sempre confirme os preços no estabelecimento antes da compra
            </span>
          </div>
          {actualOffers.length > 0 && (
            <div className="mt-3 text-sm text-green-600 font-medium">
              ✨ {actualOffers.length} contribuição(ões) real(is) de usuários hoje!
            </div>
          )}
          {actualOffers.length === 0 && (
            <div className="mt-3 text-sm text-blue-600">
              📝 Seja o primeiro a contribuir com preços hoje!
            </div>
          )}
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
