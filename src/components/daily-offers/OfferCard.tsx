
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Bell, BellPlus, Check } from "lucide-react";
import { DailyOffer } from "@/lib/types";
import { priceAlertService } from "@/services/priceAlertService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface OfferCardProps {
  offer: DailyOffer;
  index: number;
  isSignedIn: boolean;
  showAll: boolean;
  isBlurred: boolean;
}

const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  index,
  isSignedIn,
  showAll,
  isBlurred
}) => {
  const { user } = useAuth();
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [alertCreated, setAlertCreated] = useState(false);

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

  const handleCreateAlert = async () => {
    if (!user) {
      toast.error("Faça login para criar alertas de preço");
      return;
    }

    setIsCreatingAlert(true);
    try {
      // Create alert for 10% below current price
      const targetPrice = offer.price * 0.9;
      await priceAlertService.createAlert(user.id, {
        product_name: offer.productName,
        target_price: targetPrice,
        current_price: offer.price,
        store_name: offer.storeName,
        city: offer.city,
        state: offer.state
      });
      setAlertCreated(true);
      toast.success(`Alerta criado! Você será notificado quando ${offer.productName} baixar para ${formatPrice(targetPrice)}`);
    } catch (error) {
      toast.error("Erro ao criar alerta");
    } finally {
      setIsCreatingAlert(false);
    }
  };

  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-300 border-l-4 ${
        offer.verified ? 'border-l-green-500' : 'border-l-orange-500'
      } ${isBlurred ? 'blur-sm pointer-events-none' : ''}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">
            {offer.productName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded-full text-xs ${
              offer.verified 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
            }`}>
              {offer.verified ? '✓ Verificado' : 'Não verificado'}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-app-green">
              {formatPrice(offer.price)}
            </div>
            {isSignedIn && !isBlurred && (
              <Button
                variant={alertCreated ? "outline" : "ghost"}
                size="sm"
                onClick={handleCreateAlert}
                disabled={isCreatingAlert || alertCreated}
                className={alertCreated ? "text-green-600 border-green-600" : "text-muted-foreground hover:text-primary"}
              >
                {alertCreated ? (
                  <>
                    <Check className="w-4 h-4 mr-1" aria-hidden="true" />
                    Alerta ativo
                  </>
                ) : (
                  <>
                    <BellPlus className="w-4 h-4 mr-1" aria-hidden="true" />
                    Criar alerta
                  </>
                )}
              </Button>
            )}
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <span className="font-medium text-foreground">{offer.storeName}</span>
            </div>
            
            <div className="flex items-center">
              <MapPin size={14} className="mr-1" aria-hidden="true" />
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
  );
};

export default OfferCard;
