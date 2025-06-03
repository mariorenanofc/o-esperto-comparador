
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { DailyOffer } from "@/lib/types";

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
  );
};

export default OfferCard;
