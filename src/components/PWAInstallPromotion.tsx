import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Smartphone, 
  Download, 
  X, 
  Zap, 
  Wifi,
  Bell,
  Star
} from 'lucide-react';

export const PWAInstallPromotion: React.FC = () => {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall();
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostrar promoção PWA apenas se não estiver instalado e for dispositivo mobile
    if (isInstallable && !isInstalled && isMobile) {
      const hasSeenPromotion = localStorage.getItem('pwa-promotion-seen');
      if (!hasSeenPromotion) {
        setIsVisible(true);
      }
    }
  }, [isInstallable, isInstalled, isMobile]);

  const handleInstall = async () => {
    await installPWA();
    setIsVisible(false);
    localStorage.setItem('pwa-promotion-seen', 'true');
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-promotion-seen', 'true');
  };

  if (!isVisible || isInstalled) {
    return null;
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200/50 dark:border-blue-800/50 shadow-xl">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse" />
      
      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                📱 Instalar App
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Experiência mobile completa
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-4">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Instale nosso app para ter acesso a recursos exclusivos:
          </p>
          
          <div className="grid gap-2">
            <div className="flex items-center gap-3 text-sm">
              <Badge variant="secondary" className="p-1">
                <Zap className="w-3 h-3" />
              </Badge>
              <span>Acesso offline completo</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Badge variant="secondary" className="p-1">
                <Bell className="w-3 h-3" />
              </Badge>
              <span>Notificações push instantâneas</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Badge variant="secondary" className="p-1">
                <Star className="w-3 h-3" />
              </Badge>
              <span>Performance superior</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleInstall}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Instalar App
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};