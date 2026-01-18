import React, { useState } from "react";
import { Bell, BellOff, Trash2, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { priceAlertService, PriceAlert } from "@/services/priceAlertService";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const PriceAlertsList: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["price-alerts", user?.id],
    queryFn: () => priceAlertService.getUserAlerts(user!.id),
    enabled: !!user,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      priceAlertService.toggleAlert(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-alerts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => priceAlertService.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-alerts"] });
      toast.success("Alerta removido");
    },
  });

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Faça login para gerenciar seus alertas de preço.
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BellOff className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">Nenhum alerta configurado</h3>
          <p className="text-muted-foreground">
            Crie alertas para ser notificado quando os preços baixarem.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-hero-primary" />
          Meus Alertas de Preço
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border transition-all ${
              alert.is_active
                ? "bg-white dark:bg-gray-800 border-border"
                : "bg-muted/50 border-muted opacity-60"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{alert.product_name}</h4>
                  {alert.notification_sent && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      Preço baixou!
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    Alerta quando: <span className="font-medium text-hero-success">R$ {alert.target_price.toFixed(2)}</span>
                  </p>
                  {alert.current_price && (
                    <p>Preço atual: R$ {alert.current_price.toFixed(2)}</p>
                  )}
                  {alert.store_name && <p>Loja: {alert.store_name}</p>}
                  {alert.city && <p>Local: {alert.city}, {alert.state}</p>}
                  <p className="text-xs">
                    Criado {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Switch
                  checked={alert.is_active}
                  onCheckedChange={(checked) => 
                    toggleMutation.mutate({ id: alert.id, isActive: checked })
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(alert.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PriceAlertsList;
