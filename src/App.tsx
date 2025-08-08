// src/App.tsx

import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "@/components/ui/sonner"; // <-- LINHA ALTERADA

import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import ThemeProvider from "./components/ThemeProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Home from "./pages/Index";
import Comparison from "./pages/Comparison";
import Contribute from "./pages/Contribute";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Plans from "./pages/Plans";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Admin from "./pages/Admin";
import UserDetailPage from "./pages/admin/UserDetailPage";
import PWAInstallBanner from "./components/PWAInstallBanner";

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
              <Toaster /> {/* Este agora é o Toaster do sonner */}
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/comparison" element={<ProtectedRoute><Comparison /></ProtectedRoute>} />
                  <Route path="/contribute" element={<ProtectedRoute><Contribute /></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
                  <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/sign-in" element={<SignIn />} />
                  <Route path="/sign-up" element={<SignUp />} />
                  <Route path="*" element={<NotFound />} />
                  <Route
                    path="/admin/users/:userId"
                    element={<AdminRoute><UserDetailPage /></AdminRoute>}
                  />
                </Routes>
                <PWAInstallBanner />
              </div>
            </Router>
          </SubscriptionProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
