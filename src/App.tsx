// src/App.tsx

import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import ThemeProvider from "./components/ThemeProvider";
import { AppContent } from "./components/AppContent";
import PushInitializer from "./components/PushInitializer";
import { NotificationSystem } from "./components/NotificationSystem";

// Create QueryClient with proper configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
          <SubscriptionProvider>
            <Router>
              <Toaster />
              <PushInitializer />
              <NotificationSystem />
              <AppContent />
            </Router>
          </SubscriptionProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
