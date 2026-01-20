import React from 'react';
import { useOffline } from '@/hooks/useOffline';
import { syncService } from '@/services/syncService';
import { useAuth } from '@/hooks/useAuth';
import { WifiOff, Wifi, RotateCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const OfflineIndicator: React.FC = () => {
  const { isOffline } = useOffline();
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [unsyncedData, setUnsyncedData] = React.useState({ comparisons: 0, contributions: 0 });

  React.useEffect(() => {
    const updateUnsyncedData = () => {
      setUnsyncedData(syncService.getUnsyncedDataCount());
    };

    updateUnsyncedData();
    const interval = setInterval(updateUnsyncedData, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if (!user || isSyncing) return;

    setIsSyncing(true);
    try {
      await syncService.syncOfflineData(user.id);
      setUnsyncedData({ comparisons: 0, contributions: 0 });
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const hasUnsyncedData = unsyncedData.comparisons > 0 || unsyncedData.contributions > 0;

  if (!isOffline && !hasUnsyncedData) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 bg-background/90 backdrop-blur-sm border rounded-lg p-3 shadow-lg max-w-sm" role="status" aria-live="polite">
      <div className="flex items-center gap-2">
        {isOffline ? (
          <>
            <WifiOff className="h-4 w-4 text-destructive" aria-hidden="true" />
            <span className="text-sm font-medium text-destructive">Modo Offline</span>
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4 text-green-500" aria-hidden="true" />
            <span className="text-sm font-medium text-green-600">Conectado</span>
          </>
        )}
      </div>

      {hasUnsyncedData && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">Dados não sincronizados:</span>
          </div>
          
          <div className="flex gap-2">
            {unsyncedData.comparisons > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unsyncedData.comparisons} comparações
              </Badge>
            )}
            {unsyncedData.contributions > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unsyncedData.contributions} contribuições
              </Badge>
            )}
          </div>

          {!isOffline && (
            <Button
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full"
              aria-label={isSyncing ? 'Sincronizando dados' : 'Sincronizar dados'}
            >
              <RotateCw className={`h-3 w-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} aria-hidden="true" />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
          )}
        </div>
      )}

      {isOffline && (
        <p className="text-xs text-muted-foreground mt-2">
          Suas ações serão salvas e sincronizadas quando voltar online.
        </p>
      )}
    </div>
  );
};