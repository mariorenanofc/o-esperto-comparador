import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  Settings,
  Save,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface DashboardWidget {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'metric';
  title: string;
  dataSource: string;
  config: {
    xAxis?: string;
    yAxis?: string;
    color?: string;
    size?: 'small' | 'medium' | 'large';
  };
  position: { x: number; y: number };
  enabled: boolean;
}

interface CustomDashboardProps {
  userId: string;
  className?: string;
}

const SAMPLE_DATA = {
  users: [
    { month: 'Jan', count: 45 },
    { month: 'Fev', count: 52 },
    { month: 'Mar', count: 61 },
    { month: 'Abr', count: 73 }
  ],
  comparisons: [
    { day: 'Seg', count: 12 },
    { day: 'Ter', count: 19 },
    { day: 'Qua', count: 15 },
    { day: 'Qui', count: 22 },
    { day: 'Sex', count: 28 }
  ],
  plans: [
    { name: 'Free', value: 65, color: '#8884d8' },
    { name: 'Premium', value: 25, color: '#82ca9d' },
    { name: 'Pro', value: 10, color: '#ffc658' }
  ]
};

export const CustomDashboard: React.FC<CustomDashboardProps> = ({
  userId,
  className
}) => {
  const { toast } = useToast();
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);

  const defaultWidgets: DashboardWidget[] = [
    {
      id: '1',
      type: 'bar',
      title: 'Novos Usuários',
      dataSource: 'users',
      config: { xAxis: 'month', yAxis: 'count', color: '#8884d8', size: 'medium' },
      position: { x: 0, y: 0 },
      enabled: true
    },
    {
      id: '2',
      type: 'line',
      title: 'Comparações por Dia',
      dataSource: 'comparisons',
      config: { xAxis: 'day', yAxis: 'count', color: '#82ca9d', size: 'medium' },
      position: { x: 1, y: 0 },
      enabled: true
    },
    {
      id: '3',
      type: 'pie',
      title: 'Distribuição de Planos',
      dataSource: 'plans',
      config: { size: 'small' },
      position: { x: 0, y: 1 },
      enabled: true
    }
  ];

  useEffect(() => {
    loadDashboard();
  }, [userId]);

  const loadDashboard = async () => {
    // For now, use default widgets. In a real implementation,
    // this would load from the database
    setWidgets(defaultWidgets);
  };

  const saveDashboard = async () => {
    try {
      // In a real implementation, save to database
      // await supabase.from('user_dashboards').upsert({
      //   user_id: userId,
      //   widgets: widgets
      // });
      
      toast({
        title: "Dashboard salvo",
        description: "Suas configurações foram salvas com sucesso"
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar o dashboard",
        variant: "destructive"
      });
    }
  };

  const addWidget = () => {
    const newWidget: DashboardWidget = {
      id: Date.now().toString(),
      type: 'bar',
      title: 'Novo Widget',
      dataSource: 'users',
      config: { color: '#8884d8', size: 'medium' },
      position: { x: 0, y: widgets.length },
      enabled: true
    };
    setWidgets([...widgets, newWidget]);
    setSelectedWidget(newWidget);
  };

  const updateWidget = (widgetId: string, updates: Partial<DashboardWidget>) => {
    setWidgets(widgets.map(w => w.id === widgetId ? { ...w, ...updates } : w));
  };

  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
    if (selectedWidget?.id === widgetId) {
      setSelectedWidget(null);
    }
  };

  const renderWidget = (widget: DashboardWidget) => {
    if (!widget.enabled) return null;

    const data = SAMPLE_DATA[widget.dataSource as keyof typeof SAMPLE_DATA];
    const sizeClasses = {
      small: 'col-span-1 row-span-1',
      medium: 'col-span-2 row-span-1', 
      large: 'col-span-3 row-span-2'
    };

    return (
      <Card 
        key={widget.id}
        className={`${sizeClasses[widget.config.size || 'medium']} ${
          isEditing && selectedWidget?.id === widget.id ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => isEditing && setSelectedWidget(widget)}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            {widget.title}
            {isEditing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  removeWidget(widget.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ResponsiveContainer width="100%" height={widget.config.size === 'large' ? 300 : 150}>
            {(() => {
              if (widget.type === 'bar') {
                return (
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={widget.config.xAxis} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey={widget.config.yAxis} fill={widget.config.color} />
                  </BarChart>
                );
              }
              
              if (widget.type === 'line') {
                return (
                  <RechartsLineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={widget.config.xAxis} />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey={widget.config.yAxis} 
                      stroke={widget.config.color} 
                    />
                  </RechartsLineChart>
                );
              }
              
              if (widget.type === 'pie') {
                return (
                  <RechartsPieChart>
                    <Pie
                      dataKey="value"
                      data={data}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label
                    >
                      {(data as any[]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                );
              }
              
              return null;
            })()}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meu Dashboard</h2>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={addWidget}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Widget
              </Button>
              <Button onClick={saveDashboard}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Dashboard
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 min-h-[400px]">
        {widgets.map(renderWidget)}
      </div>

      {isEditing && selectedWidget && (
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Widget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={selectedWidget.title}
                onChange={(e) => updateWidget(selectedWidget.id, { title: e.target.value })}
              />
            </div>
            
            <div>
              <Label>Tipo</Label>
              <select
                value={selectedWidget.type}
                onChange={(e) => updateWidget(selectedWidget.id, { type: e.target.value as any })}
                className="w-full px-3 py-2 border border-border rounded-md"
              >
                <option value="bar">Gráfico de Barras</option>
                <option value="line">Gráfico de Linha</option>
                <option value="pie">Gráfico de Pizza</option>
              </select>
            </div>

            <div>
              <Label>Tamanho</Label>
              <select
                value={selectedWidget.config.size || 'medium'}
                onChange={(e) => updateWidget(selectedWidget.id, { 
                  config: { ...selectedWidget.config, size: e.target.value as any }
                })}
                className="w-full px-3 py-2 border border-border rounded-md"
              >
                <option value="small">Pequeno</option>
                <option value="medium">Médio</option>
                <option value="large">Grande</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Widget Ativo</Label>
              <Switch
                checked={selectedWidget.enabled}
                onCheckedChange={(checked) => updateWidget(selectedWidget.id, { enabled: checked })}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};