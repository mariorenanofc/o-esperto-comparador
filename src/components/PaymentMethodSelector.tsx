import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, QrCode, Loader2 } from "lucide-react";
import { PlanTier, getPlanById } from "@/lib/plans";

interface PaymentMethodSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: "stripe" | "mercadopago") => void;
  selectedPlan: PlanTier | null;
  isLoading: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  isOpen,
  onClose,
  onSelectMethod,
  selectedPlan,
  isLoading,
}) => {
  const plan = selectedPlan ? getPlanById(selectedPlan) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            Escolha como pagar
          </DialogTitle>
          <DialogDescription className="text-center">
            {plan && (
              <span>
                Plano <strong>{plan.name}</strong> - R${" "}
                {plan.price.toFixed(2).replace(".", ",")}/mês
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 mt-4">
          {/* Stripe Option */}
          <Button
            variant="outline"
            className="h-auto py-4 px-4 flex items-center justify-start gap-4 hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => onSelectMethod("stripe")}
            disabled={isLoading}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Cartão de Crédito</p>
              <p className="text-sm text-muted-foreground">
                Via Stripe • Pagamento internacional
              </p>
            </div>
            {isLoading && <Loader2 className="w-5 h-5 animate-spin ml-auto" />}
          </Button>

          {/* Mercado Pago Option */}
          <Button
            variant="outline"
            className="h-auto py-4 px-4 flex items-center justify-start gap-4 hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => onSelectMethod("mercadopago")}
            disabled={isLoading}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">PIX, Boleto ou Cartão</p>
              <p className="text-sm text-muted-foreground">
                Via Mercado Pago • Métodos brasileiros
              </p>
            </div>
            {isLoading && <Loader2 className="w-5 h-5 animate-spin ml-auto" />}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Pagamento processado de forma segura. Cancele a qualquer momento.
        </p>
      </DialogContent>
    </Dialog>
  );
};
