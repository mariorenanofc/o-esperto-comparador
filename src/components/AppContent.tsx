import React from "react";
import { Routes, Route } from "react-router-dom";
import { useRealTimeUserStatus } from "@/hooks/useRealTimeUserStatus";

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

// Lazy-loaded pages to reduce initial bundle on mobile
const Home = React.lazy(() => import("@/pages/Index"));
const Comparison = React.lazy(() => import("@/pages/Comparison"));
const Contribute = React.lazy(() => import("@/pages/Contribute"));
const Reports = React.lazy(() => import("@/pages/Reports"));
const Economy = React.lazy(() => import("@/pages/Economy"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const Terms = React.lazy(() => import("@/pages/Terms"));
const Privacy = React.lazy(() => import("@/pages/Privacy"));
const Plans = React.lazy(() => import("@/pages/Plans"));
const Success = React.lazy(() => import("@/pages/Success"));
const SignIn = React.lazy(() => import("@/pages/SignIn"));
const SignUp = React.lazy(() => import("@/pages/SignUp"));
const Admin = React.lazy(() => import("@/pages/Admin"));
const UserDetailPage = React.lazy(() => import("@/pages/admin/UserDetailPage"));

import PWAInstallBanner from "./PWAInstallBanner";
import { OfflineIndicator } from "./OfflineIndicator";

export const AppContent: React.FC = () => {
  // Initialize real-time user status tracking inside the provider context
  useRealTimeUserStatus();

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <React.Suspense fallback={<div className="p-6 text-center">Carregando…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/comparison" element={<ProtectedRoute><Comparison /></ProtectedRoute>} />
            <Route path="/contribute" element={<ProtectedRoute><Contribute /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/economy" element={<ProtectedRoute><Economy /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
            <Route path="/success" element={<Success />} />
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
        </React.Suspense>
        <PWAInstallBanner />
        <OfflineIndicator />
      </div>
    </>
  );
};