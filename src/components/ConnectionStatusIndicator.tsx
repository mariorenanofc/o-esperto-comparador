import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';

interface ConnectionStatus {
  isConnected: boolean;
  isConnecting?: boolean;
  lastConnected: Date | null;
  retryCount: number;
  usingFallback: boolean;
}

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
  className?: string;
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({ 
  status, 
  className = "" 
}) => {
  // Don't show indicator when successfully connected (clean UX)
  if (status.isConnected && !status.usingFallback) {
    return null;
  }

  const getStatusInfo = () => {
    // Show connecting state during initial connection
    if (status.isConnecting) {
      return {
        icon: <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />,
        text: "Conectando",
        variant: "secondary" as const,
        className: "bg-muted text-muted-foreground border-border",
        ariaLabel: "Status: Conectando ao servidor"
      };
    }

    if (status.isConnected) {
      return {
        icon: <Wifi className="w-3 h-3" aria-hidden="true" />,
        text: "Online",
        variant: "default" as const,
        className: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800",
        ariaLabel: "Status: Conectado"
      };
    }
    
    if (status.usingFallback) {
      return {
        icon: <RefreshCw className="w-3 h-3 animate-spin" aria-hidden="true" />,
        text: "Fallback",
        variant: "secondary" as const,
        className: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
        ariaLabel: "Status: Usando conexão alternativa"
      };
    }
    
    if (status.retryCount > 0) {
      return {
        icon: <AlertTriangle className="w-3 h-3" aria-hidden="true" />,
        text: `Reconectando (${status.retryCount}/3)`,
        variant: "destructive" as const,
        className: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800",
        ariaLabel: `Status: Reconectando, tentativa ${status.retryCount} de 3`
      };
    }
    
    return {
      icon: <WifiOff className="w-3 h-3" aria-hidden="true" />,
      text: "Offline",
      variant: "destructive" as const,
      className: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800",
      ariaLabel: "Status: Desconectado"
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Badge 
      variant={statusInfo.variant}
      className={`${statusInfo.className} ${className}`}
      role="status"
      aria-label={statusInfo.ariaLabel}
    >
      <div className="flex items-center gap-1">
        {statusInfo.icon}
        <span className="text-xs">{statusInfo.text}</span>
      </div>
    </Badge>
  );
};
