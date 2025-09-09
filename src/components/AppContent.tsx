import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useRealTimeUserStatus } from "@/hooks/useRealTimeUserStatus";

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

// Importações diretas para evitar problemas de lazy loading
import Home from "@/pages/Index";
import Comparison from "@/pages/Comparison";
import ProductCatalog from "@/pages/ProductCatalog";
import Contribute from "@/pages/Contribute";
import Reports from "@/pages/Reports";
import Economy from "@/pages/Economy";
import NotFound from "@/pages/NotFound";
import Profile from "@/pages/Profile";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Plans from "@/pages/Plans";
import Notifications from "@/pages/Notifications";
import Success from "@/pages/Success";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Admin from "@/pages/Admin";
import UserDetailPage from "@/pages/admin/UserDetailPage";

import PWAInstallBanner from "./PWAInstallBanner";
import { PWAInstallPromotion } from "./PWAInstallPromotion";
import { OfflineIndicator } from "./OfflineIndicator";

export const AppContent: React.FC = () => {
  // Initialize real-time user status tracking inside the provider context
  useRealTimeUserStatus();

  return (
    <>
      <PWAInstallBanner />
      <PWAInstallPromotion />
      <OfflineIndicator />
      
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/comparison" element={<Comparison />} />
          <Route path="/products" element={<ProductCatalog />} />
          <Route
            path="/contribute"
            element={
              <ProtectedRoute>
                <Contribute />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/economy" 
            element={
              <ProtectedRoute>
                <Economy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plans"
            element={
              <ProtectedRoute>
                <Plans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route 
            path="/admin/user/:userId" 
            element={
              <AdminRoute>
                <UserDetailPage />
              </AdminRoute>
            } 
          />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/sign-in" element={<Navigate to="/signin" replace />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/success" element={<Success />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
};