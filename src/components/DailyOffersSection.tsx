
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { dailyOffersService } from "@/services/dailyOffersService";
import { DailyOffer } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyOffersHeader } from "./daily-offers/DailyOffersHeader";
import { LoadingState } from "./daily-offers/LoadingState";
import { LoginOverlay } from "./daily-offers/LoginOverlay";
import { OffersGrid } from "./daily-offers/OffersGrid";
import { ContributeCallToAction } from "./daily-offers/ContributeCallToAction";
import { toast } from "sonner";

const DailyOffersSection: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [offers, setOffers] = useState<DailyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    if (authLoading) return;
    
    try {
      console.log('Fetching daily offers...');
      setLoading(true);
      setError(null);
      
      const fetchedOffers = await dailyOffersService.getTodaysOffers();
      console.log('Fetched offers:', fetchedOffers);
      
      setOffers(fetchedOffers);
      
      if (fetchedOffers.length === 0) {
        console.log('No offers found for today');
      }
    } catch (error) {
      console.error('Error fetching daily offers:', error);
      setError('Erro ao carregar ofertas do dia');
      toast.error('Erro ao carregar ofertas do dia');
    } finally {
      setLoading(false);
    }
  }, [authLoading]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  if (authLoading || loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Erro</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <button 
            onClick={fetchOffers}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 relative">
      <DailyOffersHeader />
      
      {!user && <LoginOverlay />}
      
      {offers.length > 0 ? (
        <OffersGrid offers={offers} />
      ) : (
        <ContributeCallToAction />
      )}
    </div>
  );
};

export default DailyOffersSection;
