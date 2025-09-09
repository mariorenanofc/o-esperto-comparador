import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Save,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { toast } from 'sonner';
import { userDashboardService, DashboardWidget, CreateWidgetData } from '@/services/analytics/userDashboardService';

// Using DashboardWidget from service

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
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);
  const [loading, setLoading] = useState(true);

  const defaultWidgets: CreateWidgetData[] = [
    {
      widget_type: 'bar',
      widget_config: { 
        title: 'Novos Usuários',
        dataSource: 'users',
        xAxis: 'month', 
        yAxis: 'count', 
        color: '#8884d8', 
        size: 'medium' 
      },
      position_x: 0,
      position_y: 0,
      width: 2,
      height: 1,
      enabled: true
    },
    {
      widget_type: 'line',
      widget_config: { 
        title: 'Comparações por Dia',
        dataSource: 'comparisons',
        xAxis: 'day', 
        yAxis: 'count', 
        color: '#82ca9d', 
        size: 'medium' 
      },
      position_x: 2,
      position_y: 0,
      width: 2,
      height: 1,
      enabled: true
    },
    {
      widget_type: 'pie',
      widget_config: { 
        title: 'Distribuição de Planos',
        dataSource: 'plans',
        size: 'small' 
      },
      position_x: 0,
      position_y: 1,
      width: 1,
      height: 1,
      enabled: true
    }
  ];

  useEffect(() => {
    loadDashboard();
  }, [userId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const userWidgets = await userDashboardService.getUserWidgets(userId);
      
      if (userWidgets.length === 0) {
        // First time user - create default widgets
        const createdWidgets: DashboardWidget[] = [];
        for (const defaultWidget of defaultWidgets) {
          const created = await userDashboardService.createWidget(userId, defaultWidget);
          createdWidgets.push(created);
        }
        setWidgets(createdWidgets);
      } else {
        setWidgets(userWidgets);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  const saveDashboard = async () => {
    try {
      await userDashboardService.saveUserDashboard(userId, widgets);
      toast.success("Dashboard salvo com sucesso!");
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving dashboard:', error);
      toast.error("Erro ao salvar o dashboard");
    }
  };

  const addWidget = async () => {
    try {
      const newWidgetData: CreateWidgetData = {
        widget_type: 'bar',
        widget_config: { 
          title: 'Novo Widget',
          dataSource: 'users',
          color: '#8884d8', 
          size: 'medium' 
        },
        position_x: 0,
        position_y: widgets.length,
        width: 2,
        height: 1,
        enabled: true
      };
      
      const newWidget = await userDashboardService.createWidget(userId, newWidgetData);
      setWidgets([...widgets, newWidget]);
      setSelectedWidget(newWidget);
    } catch (error) {
      console.error('Error adding widget:', error);
      toast.error('Erro ao adicionar widget');
    }
  };

  const updateWidget = async (widgetId: string, updates: Partial<CreateWidgetData>) => {
    try {
      const updatedWidget = await userDashboardService.updateWidget(widgetId, updates);
      setWidgets(widgets.map(w => w.id === widgetId ? updatedWidget : w));
      if (selectedWidget?.id === widgetId) {
        setSelectedWidget(updatedWidget);
      }
    } catch (error) {
      console.error('Error updating widget:', error);
      toast.error('Erro ao atualizar widget');
    }
  };

  const removeWidget = async (widgetId: string) => {
    try {
      await userDashboardService.deleteWidget(widgetId);
      setWidgets(widgets.filter(w => w.id !== widgetId));
      if (selectedWidget?.id === widgetId) {
        setSelectedWidget(null);
      }
    } catch (error) {
      console.error('Error removing widget:', error);
      toast.error('Erro ao remover widget');
    }
  };

  const renderWidget = (widget: DashboardWidget) => {
    if (!widget.enabled) return null;

    const data = SAMPLE_DATA[widget.widget_config.dataSource as keyof typeof SAMPLE_DATA];
    const sizeClasses = {
      small: 'col-span-1 row-span-1',
      medium: 'col-span-2 row-span-1', 
      large: 'col-span-3 row-span-2'
    };

    return (
      <Card 
        key={widget.id}
        className={`${sizeClasses[widget.widget_config.size || 'medium']} ${
          isEditing && selectedWidget?.id === widget.id ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => isEditing && setSelectedWidget(widget)}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            {widget.widget_config.title}
            {isEditing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  removeWidget(widget.id!);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ResponsiveContainer width="100%" height={widget.widget_config.size === 'large' ? 300 : 150}>
            {(() => {
              if (widget.widget_type === 'bar') {
                return (
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={widget.widget_config.xAxis} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey={widget.widget_config.yAxis} fill={widget.widget_config.color} />
                  </BarChart>
                );
              }
              
              if (widget.widget_type === 'line') {
                return (
                  <RechartsLineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={widget.widget_config.xAxis} />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey={widget.widget_config.yAxis} 
                      stroke={widget.widget_config.color} 
                    />
                  </RechartsLineChart>
                );
              }
              
              if (widget.widget_type === 'pie') {
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

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Meu Dashboard</h2>
        </div>
        <div className="text-center py-8">
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

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
                value={selectedWidget.widget_config.title}
                onChange={(e) => updateWidget(selectedWidget.id!, { 
                  widget_config: { ...selectedWidget.widget_config, title: e.target.value }
                })}
              />
            </div>
            
            <div>
              <Label>Tipo</Label>
              <select
                value={selectedWidget.widget_type}
                onChange={(e) => updateWidget(selectedWidget.id!, { widget_type: e.target.value as any })}
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
                value={selectedWidget.widget_config.size || 'medium'}
                onChange={(e) => updateWidget(selectedWidget.id!, { 
                  widget_config: { ...selectedWidget.widget_config, size: e.target.value as any }
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
                onCheckedChange={(checked) => updateWidget(selectedWidget.id!, { enabled: checked })}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};