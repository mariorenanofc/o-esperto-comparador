import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SubscriptionData {
  totalInvested: number;
  monthsSubscribed: number;
  firstPaymentDate: Date | null;
  lastPaymentDate: Date | null;
  planEndDate: Date | null;
  nextBillingDate: Date | null;
  accessSuspended: boolean;
}

interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  date: Date;
  plan: string;
  status: string;
}

interface SubscriptionStatsCardProps {
  subscriptionData: SubscriptionData;
  paymentHistory: PaymentHistory[];
  currentPlan: string;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function SubscriptionStatsCard({ 
  subscriptionData, 
  paymentHistory, 
  currentPlan,
  onRefresh,
  isLoading = false
}: SubscriptionStatsCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getTimeRemaining = () => {
    if (!subscriptionData.planEndDate) return null;
    
    const now = new Date();
    const endDate = new Date(subscriptionData.planEndDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return { expired: true, days: 0 };
    }
    
    return { expired: false, days: diffDays };
  };

  const timeRemaining = getTimeRemaining();
  const averageMonthlyValue = subscriptionData.monthsSubscribed > 0 ? 
    subscriptionData.totalInvested / subscriptionData.monthsSubscribed : 0;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Status da Assinatura</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? "Atualizando..." : "Atualizar"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Geral */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {subscriptionData.accessSuspended ? (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            ) : (
              <CheckCircle className="h-5 w-5 text-success" />
            )}
            <span className="font-medium">
              {subscriptionData.accessSuspended ? "Acesso Suspenso" : "Acesso Ativo"}
            </span>
          </div>
          <Badge variant={currentPlan === 'free' ? 'outline' : 'default'}>
            {currentPlan === 'pro' ? 'Pro' : currentPlan === 'premium' ? 'Premium' : 'Free'}
          </Badge>
        </div>

        {/* Tempo Restante */}
        {timeRemaining && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Tempo até o vencimento</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold ${timeRemaining.expired ? 'text-destructive' : timeRemaining.days <= 7 ? 'text-warning' : 'text-success'}`}>
                {timeRemaining.expired ? 'Expirado' : `${timeRemaining.days} dias`}
              </span>
              {subscriptionData.planEndDate && (
                <span className="text-sm text-muted-foreground">
                  {format(new Date(subscriptionData.planEndDate), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              )}
            </div>
            {!timeRemaining.expired && (
              <Progress 
                value={Math.max(0, Math.min(100, (30 - timeRemaining.days) / 30 * 100))} 
                className="h-2"
              />
            )}
          </div>
        )}

        {/* Estatísticas Financeiras */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Total Investido</span>
            </div>
            <p className="text-xl font-bold text-success">
              {formatCurrency(subscriptionData.totalInvested)}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Média Mensal</span>
            </div>
            <p className="text-xl font-bold">
              {formatCurrency(averageMonthlyValue)}
            </p>
          </div>
        </div>

        {/* Histórico de Assinatura */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Histórico</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Meses como assinante:</span>
              <p className="font-semibold">{subscriptionData.monthsSubscribed}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Renovações:</span>
              <p className="font-semibold">{paymentHistory.length}</p>
            </div>
          </div>
          
          {subscriptionData.firstPaymentDate && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Primeiro pagamento:</span>
                <p className="font-semibold">
                  {format(new Date(subscriptionData.firstPaymentDate), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
              {subscriptionData.lastPaymentDate && (
                <div>
                  <span className="text-muted-foreground">Último pagamento:</span>
                  <p className="font-semibold">
                    {format(new Date(subscriptionData.lastPaymentDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Próxima Cobrança */}
        {subscriptionData.nextBillingDate && !timeRemaining?.expired && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Próxima cobrança:</span>
              <span className="text-sm font-semibold">
                {format(new Date(subscriptionData.nextBillingDate), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
          </div>
        )}

        {/* Histórico de Pagamentos Recentes */}
        {paymentHistory.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Pagamentos Recentes</span>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {paymentHistory.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {payment.plan.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(payment.date, 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}