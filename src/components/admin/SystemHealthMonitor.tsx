import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database,
  Globe,
  RefreshCw,
  Server,
  Zap,
  Wifi,
  HardDrive
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'critical';
    responseTime: number;
    connections: number;
    uptime: string;
  };
  api: {
    status: 'healthy' | 'warning' | 'critical';
    responseTime: number;
    errorRate: number;
    requestsPerMinute: number;
  };
  cache: {
    status: 'healthy' | 'warning' | 'critical';
    hitRate: number;
    memoryUsage: number;
    itemCount: number;
  };
  storage: {
    status: 'healthy' | 'warning' | 'critical';
    usedSpace: number;
    totalSpace: number;
    uploadSpeed: number;
  };
  network: {
    status: 'healthy' | 'warning' | 'critical';
    latency: number;
    bandwidth: number;
    packetLoss: number;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy': return <CheckCircle className="h-4 w-4" />;
    case 'warning': return <AlertTriangle className="h-4 w-4" />;
    case 'critical': return <AlertTriangle className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
};

export const SystemHealthMonitor: React.FC = () => {
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const { data: healthData, isLoading, refetch } = useQuery({
    queryKey: ['system-health'],
    queryFn: async (): Promise<SystemHealth> => {
      const start = performance.now();

      try {
        // Test database connection
        const dbStart = performance.now();
        const { data: dbTest, error: dbError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        const dbTime = performance.now() - dbStart;

        if (dbError) {
          logger.error('Database health check failed', dbError);
        }

        // Mock other health checks (in real app, these would be actual API calls)
        const mockHealth: SystemHealth = {
          database: {
            status: dbError ? 'critical' : dbTime > 500 ? 'warning' : 'healthy',
            responseTime: dbTime,
            connections: Math.floor(Math.random() * 50) + 10,
            uptime: '99.9%',
          },
          api: {
            status: 'healthy',
            responseTime: Math.random() * 200 + 50,
            errorRate: Math.random() * 2,
            requestsPerMinute: Math.floor(Math.random() * 1000) + 500,
          },
          cache: {
            status: 'healthy',
            hitRate: 85 + Math.random() * 10,
            memoryUsage: 60 + Math.random() * 20,
            itemCount: Math.floor(Math.random() * 10000) + 5000,
          },
          storage: {
            status: 'healthy',
            usedSpace: 25 + Math.random() * 30,
            totalSpace: 100,
            uploadSpeed: Math.random() * 50 + 20,
          },
          network: {
            status: 'healthy',
            latency: Math.random() * 100 + 50,
            bandwidth: Math.random() * 100 + 50,
            packetLoss: Math.random() * 0.5,
          },
        };

        const totalTime = performance.now() - start;
        logger.performance('System health check', totalTime);

        return mockHealth;
      } catch (error) {
        logger.error('System health check failed', error as Error);
        throw error;
      }
    },
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 15000, // Consider stale after 15 seconds
  });

  const handleRefresh = async () => {
    setLastCheck(new Date());
    try {
      await refetch();
      toast.success('Status do sistema atualizado');
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const getOverallStatus = (): 'healthy' | 'warning' | 'critical' => {
    if (!healthData) return 'warning';
    
    const statuses = [
      healthData.database.status,
      healthData.api.status,
      healthData.cache.status,
      healthData.storage.status,
      healthData.network.status,
    ];

    if (statuses.includes('critical')) return 'critical';
    if (statuses.includes('warning')) return 'warning';
    return 'healthy';
  };

  const overallStatus = getOverallStatus();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitoramento do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Verificando status do sistema...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status Geral do Sistema
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(overallStatus)}>
                {getStatusIcon(overallStatus)}
                <span className="ml-1 capitalize">{overallStatus}</span>
              </Badge>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Última verificação: {lastCheck.toLocaleTimeString()}
          </p>
        </CardHeader>
      </Card>

      {/* System Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Database */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Banco de Dados
              </div>
              <Badge variant="outline" className={getStatusColor(healthData?.database.status || 'warning')}>
                {getStatusIcon(healthData?.database.status || 'warning')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tempo de resposta:</span>
              <span>{healthData?.database.responseTime.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Conexões ativas:</span>
              <span>{healthData?.database.connections}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Uptime:</span>
              <span>{healthData?.database.uptime}</span>
            </div>
          </CardContent>
        </Card>

        {/* API */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                API
              </div>
              <Badge variant="outline" className={getStatusColor(healthData?.api.status || 'warning')}>
                {getStatusIcon(healthData?.api.status || 'warning')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tempo de resposta:</span>
              <span>{healthData?.api.responseTime.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taxa de erro:</span>
              <span>{healthData?.api.errorRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Req/min:</span>
              <span>{healthData?.api.requestsPerMinute}</span>
            </div>
          </CardContent>
        </Card>

        {/* Cache */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Cache
              </div>
              <Badge variant="outline" className={getStatusColor(healthData?.cache.status || 'warning')}>
                {getStatusIcon(healthData?.cache.status || 'warning')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Hit rate:</span>
              <span>{healthData?.cache.hitRate.toFixed(1)}%</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Uso de memória:</span>
                <span>{healthData?.cache.memoryUsage.toFixed(0)}%</span>
              </div>
              <Progress value={healthData?.cache.memoryUsage || 0} className="h-2" />
            </div>
            <div className="flex justify-between text-sm">
              <span>Itens em cache:</span>
              <span>{healthData?.cache.itemCount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Armazenamento
              </div>
              <Badge variant="outline" className={getStatusColor(healthData?.storage.status || 'warning')}>
                {getStatusIcon(healthData?.storage.status || 'warning')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Espaço usado:</span>
                <span>{healthData?.storage.usedSpace.toFixed(0)}%</span>
              </div>
              <Progress value={healthData?.storage.usedSpace || 0} className="h-2" />
            </div>
            <div className="flex justify-between text-sm">
              <span>Velocidade upload:</span>
              <span>{healthData?.storage.uploadSpeed.toFixed(0)} MB/s</span>
            </div>
          </CardContent>
        </Card>

        {/* Network */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Rede
              </div>
              <Badge variant="outline" className={getStatusColor(healthData?.network.status || 'warning')}>
                {getStatusIcon(healthData?.network.status || 'warning')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Latência:</span>
              <span>{healthData?.network.latency.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Largura de banda:</span>
              <span>{healthData?.network.bandwidth.toFixed(0)} Mbps</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Perda de pacotes:</span>
              <span>{healthData?.network.packetLoss.toFixed(2)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* System Clock */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Sistema
              </div>
              <Badge variant="outline" className="text-green-600 bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4" />
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Hora do servidor:</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Timezone:</span>
              <span>{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Versão:</span>
              <span>v1.6.0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};