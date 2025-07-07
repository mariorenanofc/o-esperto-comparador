
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePriceContributionForm } from "@/hooks/usePriceContributionForm";
import PriceContributionWarning from "./price-contribution/PriceContributionWarning";
import ProductInfoFields from "./price-contribution/ProductInfoFields";
import { Loader2 } from "lucide-react";

interface PriceContributionFormProps {
  onClose: () => void;
}

const PriceContributionForm: React.FC<PriceContributionFormProps> = ({ onClose }) => {
  const {
    formData,
    setFormData,
    isSubmitting,
    locationLoading,
    handleSubmit,
  } = usePriceContributionForm({ onClose });

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

          {locationLoading && (
            <div className="text-sm text-blue-600 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              📍 Detectando sua localização automaticamente...
            </div>
          )}

          {formData.city && formData.state && (
            <div className="text-sm text-green-600 p-3 bg-green-50 rounded-lg">
              📍 Localização: {formData.city}, {formData.state}
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || locationLoading || !formData.city}
              className="flex-1 bg-app-blue hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Compartilhar"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PriceContributionForm;
