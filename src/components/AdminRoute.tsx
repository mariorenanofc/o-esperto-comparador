import React from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { isAdmin, isLoaded } = useAdminAuth();

  console.log(
    "AdminRoute: user:",
    user?.id,
    "isAdmin:",
    isAdmin,
    "isLoaded:",
    isLoaded,
    "loading:",
    loading
  );

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-app-gray dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("AdminRoute: No user, redirecting to sign-in");
    return <Navigate to="/sign-in" replace />;
  }

  if (!isAdmin) {
    console.log("AdminRoute: User is not admin, redirecting to home");
    return <Navigate to="/" replace />;
  }

  console.log("AdminRoute: Access granted to admin panel");
  return <>{children}</>;
};

export default AdminRoute;
