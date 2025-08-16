import React from "react";
import { Routes, Route } from "react-router-dom";
import { useRealTimeUserStatus } from "@/hooks/useRealTimeUserStatus";
import { OptimizedSuspense } from "./OptimizedSuspense";
import { LoadingFallback } from "./LoadingFallback";

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

// Lazy-loaded pages com preload estratégico
const Home = React.lazy(() => import("@/pages/Index"));
const Comparison = React.lazy(() => 
  import("@/pages/Comparison").then(module => {
    // Preload componentes relacionados quando Comparison carrega
    Promise.all([
      import("@/components/ComparisonForm"),
      import("@/components/PriceTable"),
    ]);
    return module;
  })
);
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
const Admin = React.lazy(() => 
  import("@/pages/Admin").then(module => {
    // Preload componentes admin quando Admin carrega
    Promise.all([
      import("@/components/admin/UserManagementSection"),
      import("@/components/admin/AnalyticsSection"),
    ]);
    return module;
  })
);
const UserDetailPage = React.lazy(() => import("@/pages/admin/UserDetailPage"));

import PWAInstallBanner from "./PWAInstallBanner";
import { PWAInstallPromotion } from "./PWAInstallPromotion";
import { OfflineIndicator } from "./OfflineIndicator";

export const AppContent: React.FC = () => {
  // Initialize real-time user status tracking inside the provider context
  useRealTimeUserStatus();

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <OptimizedSuspense 
          fullScreen={true}
          message="Inicializando aplicação..."
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/comparison" 
              element={
                <ProtectedRoute>
                  <OptimizedSuspense message="Carregando comparador...">
                    <Comparison />
                  </OptimizedSuspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/contribute" 
              element={
                <ProtectedRoute>
                  <OptimizedSuspense message="Carregando contribuição...">
                    <Contribute />
                  </OptimizedSuspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <OptimizedSuspense message="Carregando relatórios...">
                    <Reports />
                  </OptimizedSuspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/economy" 
              element={
                <ProtectedRoute>
                  <OptimizedSuspense message="Carregando dashboard de economia...">
                    <Economy />
                  </OptimizedSuspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <OptimizedSuspense message="Carregando perfil...">
                    <Profile />
                  </OptimizedSuspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/plans" 
              element={
                <ProtectedRoute>
                  <OptimizedSuspense message="Carregando planos...">
                    <Plans />
                  </OptimizedSuspense>
                </ProtectedRoute>
              } 
            />
            <Route path="/success" element={<Success />} />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <OptimizedSuspense message="Carregando painel administrativo...">
                    <Admin />
                  </OptimizedSuspense>
                </AdminRoute>
              } 
            />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route 
              path="/admin/users/:userId"
              element={
                <AdminRoute>
                  <OptimizedSuspense message="Carregando detalhes do usuário...">
                    <UserDetailPage />
                  </OptimizedSuspense>
                </AdminRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </OptimizedSuspense>
        <PWAInstallBanner />
        <PWAInstallPromotion />
        <OfflineIndicator />
      </div>
    </>
  );
};