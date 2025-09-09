import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileDown, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  Users,
  ShoppingCart,
  MessageSquare,
  Database,
  Filter,
  Loader2
} from "lucide-react";
import { supabaseAdminService } from "@/services/supabase/adminService";
import { toast } from "sonner";

interface ReportConfig {
  type: string;
  dateRange: string;
  format: 'csv' | 'pdf';
  includeFields: string[];
}

export const ReportsExporter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ReportConfig>({
    type: 'users',
    dateRange: 'month',
    format: 'csv',
    includeFields: ['all']
  });

  const reportTypes = [
    {
      id: 'users',
      name: 'Relatório de Usuários',
      description: 'Lista completa de usuários com estatísticas',
      icon: Users,
      fields: ['name', 'email', 'plan', 'created_at', 'last_activity', 'comparisons_made']
    },
    {
      id: 'contributions',
      name: 'Relatório de Contribuições',
      description: 'Ofertas enviadas pelos usuários',
      icon: ShoppingCart,
      fields: ['product_name', 'store_name', 'price', 'city', 'verified', 'created_at']
    },
    {
      id: 'suggestions',
      name: 'Relatório de Sugestões',
      description: 'Feedback e sugestões dos usuários',
      icon: MessageSquare,
      fields: ['title', 'category', 'status', 'created_at', 'user_email']
    },
    {
      id: 'analytics',
      name: 'Relatório Analítico',
      description: 'Métricas e estatísticas da plataforma',
      icon: Database,
      fields: ['metric_name', 'value', 'period', 'growth_rate']
    }
  ];

  const dateRanges = [
    { id: 'today', name: 'Hoje' },
    { id: 'week', name: 'Última Semana' },
    { id: 'month', name: 'Último Mês' },
    { id: 'quarter', name: 'Último Trimestre' },
    { id: 'year', name: 'Último Ano' },
    { id: 'all', name: 'Todo o Período' }
  ];

  const handleFieldToggle = (field: string) => {
    setConfig(prev => {
      if (field === 'all') {
        const selectedType = reportTypes.find(t => t.id === prev.type);
        return {
          ...prev,
          includeFields: prev.includeFields.includes('all') 
            ? [] 
            : ['all', ...(selectedType?.fields || [])]
        };
      }

      const newFields = prev.includeFields.includes(field)
        ? prev.includeFields.filter(f => f !== field && f !== 'all')
        : [...prev.includeFields.filter(f => f !== 'all'), field];

      return { ...prev, includeFields: newFields };
    });
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      
      let data: any[] = [];
      let filename = '';
      
      switch (config.type) {
        case 'users':
          data = await supabaseAdminService.getAllUsers();
          filename = `usuarios_${config.dateRange}`;
          break;
          
        case 'contributions':
          data = await supabaseAdminService.getAllContributions();
          filename = `contribuicoes_${config.dateRange}`;
          break;
          
        case 'suggestions':
          data = await supabaseAdminService.getAllSuggestions();
          filename = `sugestoes_${config.dateRange}`;
          break;
          
        case 'analytics':
          data = [await supabaseAdminService.getAnalytics()];
          filename = `analytics_${config.dateRange}`;
          break;
      }

      // Filter by date range
      if (config.dateRange !== 'all' && data.length > 0) {
        data = filterByDateRange(data, config.dateRange);
      }

      // Filter by selected fields
      if (!config.includeFields.includes('all')) {
        data = data.map(item => {
          const filtered: any = {};
          config.includeFields.forEach(field => {
            if (item.hasOwnProperty(field)) {
              filtered[field] = item[field];
            }
          });
          return filtered;
        });
      }

      if (config.format === 'csv') {
        const csv = generateCSV(data);
        downloadFile(csv, `${filename}.csv`, 'text/csv');
      } else {
        // For PDF generation, you could use libraries like jsPDF or Puppeteer
        toast.info("Exportação PDF será implementada em breve");
        return;
      }

      // Log the export action
      await supabaseAdminService.logAdminAction('EXPORT_REPORT', null, {
        type: config.type,
        format: config.format,
        dateRange: config.dateRange,
        recordCount: data.length
      });

      toast.success(`Relatório ${config.format.toUpperCase()} gerado com sucesso!`);
      
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const filterByDateRange = (data: any[], range: string): any[] => {
    const now = new Date();
    const filterDate = new Date();

    switch (range) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }

    return data.filter(item => {
      const itemDate = new Date(item.created_at || item.date || now);
      return itemDate >= filterDate;
    });
  };

  const generateCSV = (data: any[]): string => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map(item => 
      headers.map(header => {
        let value = item[header];
        if (value === null || value === undefined) {
          value = '';
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        } else if (typeof value === 'boolean') {
          value = value ? 'Sim' : 'Não';
        } else if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`;
        }
        return value;
      })
    );

    return [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const selectedType = reportTypes.find(t => t.id === config.type);
  const availableFields = selectedType?.fields || [];

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map((type) => (
          <Card 
            key={type.id}
            className={`cursor-pointer transition-colors ${
              config.type === type.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
            }`}
            onClick={() => setConfig(prev => ({ ...prev, type: type.id }))}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <type.icon className="w-5 h-5" />
                {type.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{type.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Configurações do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Range and Format */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={config.dateRange} onValueChange={(value) => setConfig(prev => ({ ...prev, dateRange: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map(range => (
                    <SelectItem key={range.id} value={range.id}>
                      {range.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Formato</label>
              <Select value={config.format} onValueChange={(value: 'csv' | 'pdf') => setConfig(prev => ({ ...prev, format: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      CSV (Excel)
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      PDF
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fields Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Campos a Incluir</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-fields"
                  checked={config.includeFields.includes('all')}
                  onCheckedChange={() => handleFieldToggle('all')}
                />
                <label htmlFor="all-fields" className="text-sm font-medium">
                  Todos os campos
                </label>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3 p-3 border rounded-lg bg-muted/20">
                {availableFields.map((field) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={config.includeFields.includes(field) || config.includeFields.includes('all')}
                      onCheckedChange={() => handleFieldToggle(field)}
                      disabled={config.includeFields.includes('all')}
                    />
                    <label htmlFor={field} className="text-sm">
                      {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Relatório será gerado em {config.format.toUpperCase()}
              </span>
            </div>
            
            <Button 
              onClick={generateReport}
              disabled={loading || config.includeFields.length === 0}
              className="min-w-32"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 mr-2" />
                  Gerar Relatório
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle>Exportações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* This would be populated with actual export history */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Relatório de Usuários</p>
                  <p className="text-xs text-muted-foreground">CSV • 1,234 registros • Há 2 horas</p>
                </div>
              </div>
              <Badge variant="outline">Concluído</Badge>
            </div>

            <div className="text-center text-muted-foreground py-4">
              <FileDown className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Seus próximos relatórios aparecerão aqui</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};