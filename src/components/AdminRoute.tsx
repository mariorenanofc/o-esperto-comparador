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
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/not-authorized" replace />;
  }

  console.log("AdminRoute: Access granted to admin panel");
  return <>{children}</>;
};

export default AdminRoute;
