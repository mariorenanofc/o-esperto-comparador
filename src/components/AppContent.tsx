import React from "react";
import { Routes, Route } from "react-router-dom";
import { useRealTimeUserStatus } from "@/hooks/useRealTimeUserStatus";

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import Home from "@/pages/Index";
import Comparison from "@/pages/Comparison";
import Contribute from "@/pages/Contribute";
import Reports from "@/pages/Reports";
import Economy from "@/pages/Economy";
import NotFound from "@/pages/NotFound";
import Profile from "@/pages/Profile";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Plans from "@/pages/Plans";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Admin from "@/pages/Admin";
import UserDetailPage from "@/pages/admin/UserDetailPage";
import PWAInstallBanner from "./PWAInstallBanner";
import { OfflineIndicator } from "./OfflineIndicator";

export const AppContent: React.FC = () => {
  // Initialize real-time user status tracking inside the provider context
  useRealTimeUserStatus();

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/comparison" element={<ProtectedRoute><Comparison /></ProtectedRoute>} />
          <Route path="/contribute" element={<ProtectedRoute><Contribute /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/economy" element={<ProtectedRoute><Economy /></ProtectedRoute>} />
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
        <OfflineIndicator />
      </div>
    </>
  );
};