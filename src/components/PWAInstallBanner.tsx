import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useIsMobile } from '@/hooks/use-mobile';

const PWAInstallBanner = () => {
  const { isInstallable, installPWA } = usePWAInstall();
  const isMobile = useIsMobile();
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show on mobile devices and if installable
  if (!isInstallable || isDismissed || !isMobile) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 border-2 border-primary/20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-xl">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
              Instalar O Esperto Comparador
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Instale nosso app para acesso rápido e use offline!
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={installPWA}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Download className="w-4 h-4 mr-1" />
                Instalar
              </Button>
              
              <Button
                onClick={() => setIsDismissed(true)}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Agora não
              </Button>
            </div>
          </div>
          
          <Button
            onClick={() => setIsDismissed(true)}
            variant="ghost"
            size="sm"
            className="flex-shrink-0 w-8 h-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PWAInstallBanner;