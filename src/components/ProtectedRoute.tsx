import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallbackMessage = "Você precisa estar logado para acessar esta página.",
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-app-gray dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto p-8 bg-card rounded-xl shadow-xl border border-border">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground text-2xl">🔒</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Acesso Restrito
            </h2>
          </div>
          <p className="text-muted-foreground mb-6 leading-relaxed">{fallbackMessage}</p>
          <Link to="/">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full">
              Fazer Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
