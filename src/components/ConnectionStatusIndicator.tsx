import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

interface ConnectionStatus {
  isConnected: boolean;
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
  const getStatusInfo = () => {
    if (status.isConnected) {
      return {
        icon: <Wifi className="w-3 h-3" />,
        text: "Online",
        variant: "default" as const,
        className: "bg-green-100 text-green-800 border-green-200"
      };
    }
    
    if (status.usingFallback) {
      return {
        icon: <RefreshCw className="w-3 h-3 animate-spin" />,
        text: "Fallback",
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200"
      };
    }
    
    if (status.retryCount > 0) {
      return {
        icon: <AlertTriangle className="w-3 h-3" />,
        text: `Reconnecting (${status.retryCount}/3)`,
        variant: "destructive" as const,
        className: "bg-orange-100 text-orange-800 border-orange-200"
      };
    }
    
    return {
      icon: <WifiOff className="w-3 h-3" />,
      text: "Offline",
      variant: "destructive" as const,
      className: "bg-red-100 text-red-800 border-red-200"
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Badge 
      variant={statusInfo.variant}
      className={`${statusInfo.className} ${className}`}
    >
      <div className="flex items-center gap-1">
        {statusInfo.icon}
        <span className="text-xs">{statusInfo.text}</span>
      </div>
    </Badge>
  );
};