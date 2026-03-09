import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useRealTimeUserStatus } from "@/hooks/useRealTimeUserStatus";

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import { LoadingFallback } from "./LoadingFallback";

// Lazy loaded pages
const Home = React.lazy(() => import("@/pages/Index"));
const Comparison = React.lazy(() => import("@/pages/Comparison"));
const ProductCatalog = React.lazy(() => import("@/pages/ProductCatalog"));
const Contribute = React.lazy(() => import("@/pages/Contribute"));
const Reports = React.lazy(() => import("@/pages/Reports"));
const Economy = React.lazy(() => import("@/pages/Economy"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const Terms = React.lazy(() => import("@/pages/Terms"));
const Privacy = React.lazy(() => import("@/pages/Privacy"));
const Plans = React.lazy(() => import("@/pages/Plans"));
const Notifications = React.lazy(() => import("@/pages/Notifications"));
const Success = React.lazy(() => import("@/pages/Success"));
const SignUp = React.lazy(() => import("@/pages/SignUp"));
const Login = React.lazy(() => import("@/pages/Login"));
const AdminLogin = React.lazy(() => import("@/pages/admin/AdminLogin"));
const NotAuthorized = React.lazy(() => import("@/pages/admin/NotAuthorized"));
const UserDetailPage = React.lazy(() => import("@/pages/admin/UserDetailPage"));
const Dashboard = React.lazy(() => import("@/pages/admin/Dashboard"));
const AdminUsers = React.lazy(() => import("@/pages/admin/AdminUsers"));
const Content = React.lazy(() => import("@/pages/admin/Content"));
const AdminNotifications = React.lazy(() => import("@/pages/admin/AdminNotifications"));
const Billing = React.lazy(() => import("@/pages/admin/Billing"));
const Security = React.lazy(() => import("@/pages/admin/Security"));
const AdminSettings = React.lazy(() => import("@/pages/admin/AdminSettings"));
const Analytics = React.lazy(() => import("@/pages/admin/Analytics"));
const Alerts = React.lazy(() => import("@/pages/Alerts"));
const SmartList = React.lazy(() => import("@/pages/SmartList"));
const Gamification = React.lazy(() => import("@/pages/Gamification"));
const ApiDocs = React.lazy(() => import("@/pages/ApiDocs"));
const Search = React.lazy(() => import("@/pages/Search"));

// Direct imports for always-visible components
import { AdminLayout } from "@/components/admin/AdminLayout";
import PWAInstallBanner from "./PWAInstallBanner";
import { PWAInstallPromotion } from "./PWAInstallPromotion";
import { OfflineIndicator } from "./OfflineIndicator";
import Footer from "./Footer";

const PageFallback = <LoadingFallback message="Carregando página..." />;

export const AppContent: React.FC = () => {
  useRealTimeUserStatus();

  return (
    <>
      <PWAInstallBanner />
      <PWAInstallPromotion />
      <OfflineIndicator />
      
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1">
          <Suspense fallback={PageFallback}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/comparison" element={<Comparison />} />
              <Route path="/products" element={<ProductCatalog />} />
              <Route path="/search" element={<Search />} />
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
              <Route path="/economy" element={<Economy />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/plans" element={<Plans />} />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
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
              <Route path="/login" element={<Login />} />
              <Route path="/signin" element={<Navigate to="/login" replace />} />
              <Route path="/sign-in" element={<Navigate to="/login" replace />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/not-authorized" element={<NotAuthorized />} />
              <Route path="/success" element={<Success />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </Suspense>
        </div>
      </div>
    </>
  );
};
