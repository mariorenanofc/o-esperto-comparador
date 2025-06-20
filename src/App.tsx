
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import Home from "./pages/Index";
import Comparison from "./pages/Comparison";
import Contribute from "./pages/Contribute";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Plans from "./pages/Plans";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

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
          <p className="text-gray-600 mt-2">
            Recarregue a página para tentar novamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <Router>
            <Toaster />
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/comparison" element={<Comparison />} />
                <Route path="/contribute" element={<Contribute />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/sign-up" element={<SignUp />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
