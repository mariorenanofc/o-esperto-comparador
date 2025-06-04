
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </SubscriptionProvider>
    </QueryClientProvider>
  );
}

export default App;
