import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

export default function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkSubscription } = useSubscription();
  const sessionId = searchParams.get("session_id");
  const provider = searchParams.get("provider");

  useEffect(() => {
    // Wait a moment for payment to process, then check subscription
    const timer = setTimeout(() => {
      checkSubscription();
      if (provider === "mercadopago") {
        toast.success("Pagamento via Mercado Pago processado com sucesso!");
      } else if (sessionId) {
        toast.success("Pagamento processado com sucesso!");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId, provider, checkSubscription]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl text-green-600 dark:text-green-400">
            Pagamento Confirmado!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-muted-foreground">
            <p className="mb-2">
              Seu pagamento foi processado com sucesso.
            </p>
            <p>
              Você agora tem acesso a todos os recursos do seu plano premium!
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/")} 
              className="w-full"
            >
              Voltar ao Início
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate("/plans")}
              className="w-full"
            >
              Ver Meus Planos
            </Button>
          </div>

          {(sessionId || provider) && (
            <div className="text-xs text-muted-foreground border-t pt-4">
              {provider === "mercadopago" 
                ? "Pagamento via Mercado Pago" 
                : sessionId && `ID da Sessão: ${sessionId.substring(0, 20)}...`}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}