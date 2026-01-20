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
import Login from "@/pages/Login";
import AdminLogin from "@/pages/admin/AdminLogin";
import NotAuthorized from "@/pages/admin/NotAuthorized";
import Admin from "@/pages/Admin";
import UserDetailPage from "@/pages/admin/UserDetailPage";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import Content from "@/pages/admin/Content";
import AdminNotifications from "@/pages/admin/AdminNotifications";
import Billing from "@/pages/admin/Billing";
import Security from "@/pages/admin/Security";
import AdminSettings from "@/pages/admin/AdminSettings";
import Analytics from "@/pages/admin/Analytics";

// Novas páginas
import Alerts from "@/pages/Alerts";
import SmartList from "@/pages/SmartList";
import Gamification from "@/pages/Gamification";
import ApiDocs from "@/pages/ApiDocs";

import PWAInstallBanner from "./PWAInstallBanner";
import { PWAInstallPromotion } from "./PWAInstallPromotion";
import { OfflineIndicator } from "./OfflineIndicator";
import Footer from "./Footer";

export const AppContent: React.FC = () => {
  // Initialize real-time user status tracking inside the provider context
  useRealTimeUserStatus();

  return (
    <>
      <PWAInstallBanner />
      <PWAInstallPromotion />
      <OfflineIndicator />
      
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/products" element={<ProductCatalog />} />
            <Route path="/api-docs" element={<ApiDocs />} />
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
            {/* New Feature Routes */}
            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <Alerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/smart-list"
              element={
                <ProtectedRoute>
                  <SmartList />
                </ProtectedRoute>
              }
            />
            <Route path="/gamification" element={<Gamification />} />
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/user/:userId" 
            element={
              <AdminRoute>
                <AdminLayout>
                  <UserDetailPage />
                </AdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/users/:userId" 
            element={
              <AdminRoute>
                <AdminLayout>
                  <UserDetailPage />
                </AdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/content" 
            element={
              <AdminRoute>
                <AdminLayout>
                  <Content />
                </AdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/notifications" 
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminNotifications />
                </AdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/billing" 
            element={
              <AdminRoute>
                <AdminLayout>
                  <Billing />
                </AdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/security" 
            element={
              <AdminRoute>
                <AdminLayout>
                  <Security />
                </AdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminSettings />
                </AdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/analytics" 
            element={
              <AdminRoute>
                <AdminLayout>
                  <Analytics />
                </AdminLayout>
              </AdminRoute>
            } 
          />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* User Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signin" element={<Navigate to="/login" replace />} />
            <Route path="/sign-in" element={<Navigate to="/login" replace />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Admin Authentication Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/not-authorized" element={<NotAuthorized />} />
            <Route path="/success" element={<Success />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </>
  );
};