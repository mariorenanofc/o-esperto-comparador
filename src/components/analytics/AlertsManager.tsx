import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle,
  Bell,
  TrendingUp,
  Users,
  Activity,
  Plus,
  Edit,
  Trash2,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { alertsService, AnalyticsAlert } from '@/services/analytics/alertsService';
import { useAuth } from '@/hooks/useAuth';

interface AlertsManagerProps {
  className?: string;
}

export const AlertsManager: React.FC<AlertsManagerProps> = ({ className }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AnalyticsAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AnalyticsAlert | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<AnalyticsAlert>>({
    alert_type: 'metric_threshold',
    metric_name: 'new_users',
    comparison_operator: 'greater_than',
    threshold_value: 0,
    is_active: true,
    notification_channels: ['push']
  });

  const METRICS = [
    { value: 'new_users', label: 'Novos Usuários', icon: Users },
    { value: 'comparisons_count', label: 'Comparações Realizadas', icon: Activity },
    { value: 'error_rate', label: 'Taxa de Erro', icon: AlertTriangle },
    { value: 'response_time', label: 'Tempo de Resposta', icon: TrendingUp },
    { value: 'active_sessions', label: 'Sessões Ativas', icon: Users }
  ];

  const CONDITIONS = [
    { value: 'greater_than', label: 'Maior que', symbol: '>' },
    { value: 'less_than', label: 'Menor que', symbol: '<' },
    { value: 'equals', label: 'Igual a', symbol: '=' }
  ];

  useEffect(() => {
    if (user?.id) {
      loadAlerts();
    }
  }, [user]);

  const loadAlerts = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const alertsData = await alertsService.getUserAlerts(user.id);
      setAlerts(alertsData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar alertas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAlert = async () => {
    try {
      if (!formData.alert_type || formData.threshold_value === undefined || !user?.id) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive"
        });
        return;
      }

      if (selectedAlert?.id) {
        await alertsService.updateAlert(selectedAlert.id, formData);
      } else {
        await alertsService.createAlert(user.id, formData as any);
      }

      await loadAlerts();
      resetForm();
      
      toast({
        title: selectedAlert ? "Alerta atualizado" : "Alerta criado",
        description: "Operação realizada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar o alerta",
        variant: "destructive"
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      await alertsService.deleteAlert(alertId);
      await loadAlerts();
      toast({
        title: "Alerta removido",
        description: "Alerta foi removido com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir alerta",
        variant: "destructive"
      });
    }
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      await alertsService.toggleAlert(alertId, isActive);
      setAlerts(alerts.map(a => 
        a.id === alertId ? { ...a, is_active: isActive } : a
      ));
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do alerta",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      alert_type: 'metric_threshold',
      metric_name: 'new_users',
      comparison_operator: 'greater_than',
      threshold_value: 0,
      is_active: true,
      notification_channels: ['push']
    });
    setSelectedAlert(null);
    setIsCreating(false);
  };

  const editAlert = (alert: AnalyticsAlert) => {
    setFormData(alert);
    setSelectedAlert(alert);
    setIsCreating(true);
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Carregando alertas...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gerenciar Alertas</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Alerta
        </Button>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista de Alertas</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {alerts.map((alert) => {
            const metric = METRICS.find(m => m.value === alert.metric_name) || METRICS[0];
            const condition = CONDITIONS.find(c => c.value === alert.comparison_operator) || CONDITIONS[0];
            const MetricIcon = metric.icon;

            return (
              <Card key={alert.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MetricIcon className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">{alert.alert_type}</h3>
                        <p className="text-sm text-muted-foreground">
                          {metric.label} {condition.symbol} {alert.threshold_value}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {alert.notification_channels.map((channel) => (
                          <Badge key={channel} variant="outline" className="text-xs">
                            {channel}
                          </Badge>
                        ))}
                      </div>

                      <Switch
                        checked={alert.is_active}
                        onCheckedChange={(checked) => toggleAlert(alert.id!, checked)}
                      />

                      <Button size="sm" variant="ghost" onClick={() => editAlert(alert)}>
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button size="sm" variant="ghost" onClick={() => deleteAlert(alert.id!)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Bell className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{alerts.length}</p>
                <p className="text-sm text-muted-foreground">Total de Alertas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{alerts.filter(a => a.is_active).length}</p>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedAlert ? 'Editar Alerta' : 'Criar Novo Alerta'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome do Alerta</Label>
              <Input
                placeholder="Ex: Alto número de usuários"
                value={formData.alert_type || ''}
                onChange={(e) => setFormData({...formData, alert_type: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Métrica</Label>
                <select
                  value={formData.metric_name}
                  onChange={(e) => setFormData({...formData, metric_name: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  {METRICS.map((metric) => (
                    <option key={metric.value} value={metric.value}>
                      {metric.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Condição</Label>
                <select
                  value={formData.comparison_operator}
                  onChange={(e) => setFormData({...formData, comparison_operator: e.target.value as any})}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  {CONDITIONS.map((condition) => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Valor</Label>
                <Input
                  type="number"
                  value={formData.threshold_value || 0}
                  onChange={(e) => setFormData({...formData, threshold_value: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={saveAlert}>
                <Save className="h-4 w-4 mr-2" />
                {selectedAlert ? 'Atualizar' : 'Criar'} Alerta
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};