
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePriceContributionForm } from "@/hooks/usePriceContributionForm";
import PriceContributionWarning from "./price-contribution/PriceContributionWarning";
import ProductInfoFields from "./price-contribution/ProductInfoFields";
import LocationFields from "./price-contribution/LocationFields";

interface PriceContributionFormProps {
  onClose: () => void;
}

const PriceContributionForm: React.FC<PriceContributionFormProps> = ({ onClose }) => {
  const {
    formData,
    setFormData,
    isSubmitting,
    locationLoading,
    city,
    state,
    handleSubmit,
    updateLocationWhenLoaded,
  } = usePriceContributionForm({ onClose });

  // Atualizar localização automaticamente quando carregada
  React.useEffect(() => {
    updateLocationWhenLoaded(city || "", state || "");
  }, [city, state, updateLocationWhenLoaded]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Compartilhar Preço</CardTitle>
        <CardDescription>
          Ajude nossa comunidade com informações de preços atualizadas
        </CardDescription>
        
        <PriceContributionWarning />
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ProductInfoFields formData={formData} setFormData={setFormData} />

          <LocationFields 
            formData={formData} 
            setFormData={setFormData} 
            locationLoading={locationLoading} 
          />

          {locationLoading && (
            <div className="text-sm text-blue-600">
              📍 Detectando sua localização automaticamente...
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-app-blue hover:bg-blue-700"
            >
              {isSubmitting ? "Enviando..." : "Compartilhar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PriceContributionForm;
