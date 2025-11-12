import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  RefreshCw, 
  Trash2,
  Clock,
  User,
  Database
} from "lucide-react";
import { supabaseAdminService } from "@/services/supabase/adminService";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { logger } from "@/lib/logger";

interface AuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  target_user_id?: string;
  details?: any;
  created_at: string;
}

interface RateLimit {
  id: string;
  user_id?: string;
  endpoint: string;
  attempts: number;
  blocked_until?: string;
  created_at: string;
}

export const SecurityMonitoringSection: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { handleAsync } = useErrorHandler({ component: 'SecurityMonitoringSection' });

  const fetchSecurityData = async () => {
    const result = await handleAsync(
      async () => {
        logger.info('Fetching security data');
        const [logs, limits] = await Promise.all([
          supabaseAdminService.getAuditLogs(),
          supabaseAdminService.getRateLimits()
        ]);
        logger.info('Security data fetched', { logsCount: logs.length, limitsCount: limits.length });
        return { logs, limits };
      },
      { action: 'fetch_security_data' },
      { showToast: true, severity: 'low' }
    );
    
    if (result) {
      setAuditLogs(result.logs);
      setRateLimits(result.limits);
    }
  };

  const handleMaintenance = async (action: string) => {
    setActionLoading(action);
    await handleAsync(
      async () => {
        logger.info('Performing maintenance action', { action });
        await supabaseAdminService.performMaintenance(action);
        logger.info('Maintenance action completed', { action });
        await fetchSecurityData();
      },
      { action: 'perform_maintenance' },
      { showToast: true, severity: 'medium' }
    );
    setActionLoading(null);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchSecurityData();
      setLoading(false);
    };

    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const getActionBadge = (action: string) => {
    const actionColors: Record<string, string> = {
      'DELETE_USER': 'destructive',
      'UPDATE_USER_PLAN': 'default',
      'APPROVE_CONTRIBUTION': 'default',
      'REJECT_CONTRIBUTION': 'secondary',
      'SEND_NOTIFICATION': 'outline',
      'MAINTENANCE': 'default'
    };

    return (
      <Badge variant={actionColors[action] as any || 'outline'}>
        {action.replace(/_/g, ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Monitoramento de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Carregando dados de segurança...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ações de Manutenção */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Ações de Manutenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => handleMaintenance('cleanup_sessions')}
              disabled={actionLoading === 'cleanup_sessions'}
              className="flex items-center gap-2"
            >
              {actionLoading === 'cleanup_sessions' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Limpar Sessões Expiradas
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleMaintenance('cleanup_notifications')}
              disabled={actionLoading === 'cleanup_notifications'}
              className="flex items-center gap-2"
            >
              {actionLoading === 'cleanup_notifications' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Limpar Notificações Antigas
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleMaintenance('mark_offline')}
              disabled={actionLoading === 'mark_offline'}
              className="flex items-center gap-2"
            >
              {actionLoading === 'mark_offline' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <User className="w-4 h-4" />
              )}
              Marcar Usuários Offline
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs e Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Monitoramento de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="audit-logs">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="audit-logs" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Logs de Auditoria ({auditLogs.length})
              </TabsTrigger>
              <TabsTrigger value="rate-limits" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Rate Limits ({rateLimits.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="audit-logs" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ação</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Usuário Alvo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Nenhum log de auditoria encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {getActionBadge(log.action)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {log.admin_user_id?.substring(0, 8)}...
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {log.target_user_id ? `${log.target_user_id.substring(0, 8)}...` : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="w-3 h-3" />
                              {formatDate(log.created_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {log.details ? (
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {JSON.stringify(log.details)}
                              </code>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="rate-limits" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Tentativas</TableHead>
                      <TableHead>Bloqueado Até</TableHead>
                      <TableHead>Criado Em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rateLimits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Nenhum rate limit ativo
                        </TableCell>
                      </TableRow>
                    ) : (
                      rateLimits.map((limit) => (
                        <TableRow key={limit.id}>
                          <TableCell className="font-mono text-sm">
                            {limit.user_id ? `${limit.user_id.substring(0, 8)}...` : 'Anônimo'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{limit.endpoint}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={limit.attempts >= 10 ? 'destructive' : 'default'}
                            >
                              {limit.attempts}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {limit.blocked_until ? (
                              <div className="flex items-center gap-1 text-sm text-red-600">
                                <AlertTriangle className="w-3 h-3" />
                                {formatDate(limit.blocked_until)}
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDate(limit.created_at)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};