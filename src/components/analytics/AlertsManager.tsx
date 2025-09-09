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
  TrendingDown,
  Users,
  Activity,
  Plus,
  Edit,
  Trash2,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  name: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals';
  threshold: number;
  enabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
  channels: ('email' | 'push' | 'in_app')[];
  lastTriggered?: Date;
  triggerCount: number;
}

interface AlertsManagerProps {
  className?: string;
}

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

export const AlertsManager: React.FC<AlertsManagerProps> = ({ className }) => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<Alert>>({
    name: '',
    metric: 'new_users',
    condition: 'greater_than',
    threshold: 0,
    enabled: true,
    frequency: 'immediate',
    channels: ['push'],
    triggerCount: 0
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    // Mock data for demonstration
    const mockAlerts: Alert[] = [
      {
        id: '1',
        name: 'Alto número de novos usuários',
        metric: 'new_users',
        condition: 'greater_than',
        threshold: 50,
        enabled: true,
        frequency: 'hourly',
        channels: ['email', 'push'],
        lastTriggered: new Date(Date.now() - 86400000),
        triggerCount: 3
      },
      {
        id: '2',
        name: 'Taxa de erro elevada',
        metric: 'error_rate',
        condition: 'greater_than',
        threshold: 5,
        enabled: true,
        frequency: 'immediate',
        channels: ['push', 'in_app'],
        triggerCount: 0
      }
    ];
    
    setAlerts(mockAlerts);
  };

  const saveAlert = async () => {
    try {
      if (!formData.name || !formData.threshold) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive"
        });
        return;
      }

      const alertData: Alert = {
        ...formData,
        id: selectedAlert?.id || Date.now().toString(),
        triggerCount: selectedAlert?.triggerCount || 0
      } as Alert;

      if (selectedAlert) {
        setAlerts(alerts.map(a => a.id === selectedAlert.id ? alertData : a));
      } else {
        setAlerts([...alerts, alertData]);
      }

      toast({
        title: "Alerta salvo",
        description: "Configurações do alerta foram salvas com sucesso"
      });

      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar o alerta",
        variant: "destructive"
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
    toast({
      title: "Alerta removido",
      description: "Alerta foi removido com sucesso"
    });
  };

  const toggleAlert = async (alertId: string, enabled: boolean) => {
    setAlerts(alerts.map(a => 
      a.id === alertId ? { ...a, enabled } : a
    ));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      metric: 'new_users',
      condition: 'greater_than',
      threshold: 0,
      enabled: true,
      frequency: 'immediate',
      channels: ['push'],
      triggerCount: 0
    });
    setSelectedAlert(null);
    setIsCreating(false);
  };

  const editAlert = (alert: Alert) => {
    setFormData(alert);
    setSelectedAlert(alert);
    setIsCreating(true);
  };

  const getMetricInfo = (metricValue: string) => {
    return METRICS.find(m => m.value === metricValue) || METRICS[0];
  };

  const getConditionInfo = (conditionValue: string) => {
    return CONDITIONS.find(c => c.value === conditionValue) || CONDITIONS[0];
  };

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
            const metric = getMetricInfo(alert.metric);
            const condition = getConditionInfo(alert.condition);
            const MetricIcon = metric.icon;

            return (
              <Card key={alert.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MetricIcon className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">{alert.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {metric.label} {condition.symbol} {alert.threshold}
                          {alert.lastTriggered && (
                            <span className="ml-2">
                              • Último disparo: {alert.lastTriggered.toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={alert.triggerCount > 0 ? "default" : "secondary"}>
                        {alert.triggerCount} disparos
                      </Badge>
                      
                      <div className="flex gap-1">
                        {alert.channels.map((channel) => (
                          <Badge key={channel} variant="outline" className="text-xs">
                            {channel}
                          </Badge>
                        ))}
                      </div>

                      <Switch
                        checked={alert.enabled}
                        onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                      />

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => editAlert(alert)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteAlert(alert.id)}
                      >
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <p className="text-2xl font-bold">{alerts.filter(a => a.enabled).length}</p>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">
                  {alerts.reduce((sum, a) => sum + a.triggerCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Disparos Totais</p>
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
              <Label htmlFor="alert-name">Nome do Alerta</Label>
              <Input
                id="alert-name"
                placeholder="Ex: Alto número de usuários"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Métrica</Label>
                <select
                  value={formData.metric}
                  onChange={(e) => setFormData({...formData, metric: e.target.value})}
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
                  value={formData.condition}
                  onChange={(e) => setFormData({...formData, condition: e.target.value as any})}
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
                  value={formData.threshold}
                  onChange={(e) => setFormData({...formData, threshold: Number(e.target.value)})}
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