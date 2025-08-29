import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { initializeCacheService } from "@/services/reactiveCache";

import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { SecurityProvider } from "@/components/security/SecurityProvider";
import ThemeProvider from "./components/ThemeProvider";
import { AppContent } from "./components/AppContent";
import { useDataPreloader } from "./hooks/useOptimizedData";
import { CacheMonitor } from "./components/CacheMonitor";

// Lazy-loaded non-critical features for better mobile performance
const PushInitializerLazy = React.lazy(() => import("./components/PushInitializer"));
const NotificationSystemLazy = React.lazy(() => import("./components/NotificationSystemEnhanced").then(m => ({ default: m.NotificationSystemEnhanced })));

// Component interno para usar hooks
const AppWithHooks: React.FC = () => {
  useDataPreloader(); // Preload de dados críticos
  
  // Defer non-critical features for faster first paint on mobile
  const [deferReady, setDeferReady] = React.useState(false);
  React.useEffect(() => {
    const hasRIC = "requestIdleCallback" in window;
    let idleId: any;
    let timeoutId: any;
    const onReady = () => setDeferReady(true);
    if (hasRIC) {
      idleId = (window as any).requestIdleCallback(onReady, { timeout: 1500 });
    } else {
      timeoutId = window.setTimeout(onReady, 800);
    }
    return () => {
      if (hasRIC && idleId) (window as any).cancelIdleCallback?.(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppContent />
      <CacheMonitor />
      {deferReady && (
        <React.Suspense fallback={null}>
          <PushInitializerLazy />
          <NotificationSystemLazy />
        </React.Suspense>
      )}
      <Toaster />
    </div>
  );
};


// Create QueryClient with optimized configuration for performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos - dados considerados frescos
      gcTime: 10 * 60 * 1000, // 10 minutos - tempo que dados ficam em cache
      networkMode: 'offlineFirst', // Prioriza cache para melhor performance
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});

// Inicializar cache service
initializeCacheService(queryClient);

function App() {
  // Add defensive check for React
  if (!React || !React.useEffect) {
    console.error("React hooks not properly available");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Erro de carregamento
          </h1>
          <p className="mt-2 text-gray-600">
            Recarregue a página para tentar novamente.
          </p>
        </div>
      </div>
    );
  }
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SecurityProvider sessionTimeoutMinutes={120}>
            <SubscriptionProvider>
              <Router>
                <AppWithHooks />
              </Router>
            </SubscriptionProvider>
          </SecurityProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
