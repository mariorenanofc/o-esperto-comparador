import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePriceContributionForm } from "@/hooks/usePriceContributionForm";
import PriceContributionWarning from "./price-contribution/PriceContributionWarning";
import ProductInfoFields from "./price-contribution/ProductInfoFields";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ErrorBoundaryWithRetry } from "@/components/ErrorBoundaryWithRetry";
import { logger } from "@/lib/logger";

interface PriceContributionFormProps {
  onClose: () => void;
}

const PriceContributionFormContent: React.FC<PriceContributionFormProps> = ({
  onClose,
}) => {
  const { formData, setFormData, isSubmitting, locationLoading, handleSubmit } =
    usePriceContributionForm({ onClose });

  const onFormSubmit = (e: React.FormEvent) => {
    logger.userAction('price_contribution_submit', {
      hasLocation: !!formData.city,
      productName: formData.productName,
    });
    handleSubmit(e);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Compartilhar Preço</CardTitle>
        <CardDescription>
          Ajude nossa comunidade com informações de preços atualizadas
        </CardDescription>

        <PriceContributionWarning />
      </CardHeader>
      <ScrollArea className="h-full max-h-[70vh] sm:max-h-none">
        <CardContent>
          <form onSubmit={onFormSubmit} className="space-y-4">
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
                className="flex-1 bg-app-blue hover:bg-app-blue/90 text-white"
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
      </ScrollArea>
    </Card>
  );
};

const PriceContributionForm: React.FC<PriceContributionFormProps> = (props) => {
  return (
    <ErrorBoundaryWithRetry
      context={{
        component: 'PriceContributionForm',
        feature: 'price-contribution'
      }}
    >
      <PriceContributionFormContent {...props} />
    </ErrorBoundaryWithRetry>
  );
};

export default PriceContributionForm;
