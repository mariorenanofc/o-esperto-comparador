import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Settings } from "lucide-react";
import { logger } from "@/lib/logger";

const AdminLogin: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const { isAdmin, isLoaded } = useAdminAuth();
  const navigate = useNavigate();

  // Handle already authenticated users
  React.useEffect(() => {
    if (user && isLoaded) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        // User is logged in but not admin - show option to switch accounts
      }
    }
  }, [user, isAdmin, isLoaded, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      toast.loading("Preparando login administrativo...");
      
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin`,
        },
      });

      if (error) {
        logger.error("Google admin sign in error", error);
        toast.dismiss();
        toast.error("Erro ao fazer login administrativo. Tente novamente.");
      } else {
        toast.dismiss();
        toast.success("Redirecionando para autenticação...");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Erro inesperado. Tente novamente.");
    }
  };

  const handleSwitchAccount = async () => {
    try {
      await signOut();
      toast.success("Conta desconectada. Faça login com uma conta administrativa.");
    } catch (error) {
      toast.error("Erro ao desconectar conta.");
    }
  };

  // If user is logged in but not admin
  if (user && isLoaded && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-gradient-to-br from-white via-slate-50 to-red-50 dark:from-gray-800 dark:via-gray-700 dark:to-red-900/20 shadow-2xl border border-red-100 dark:border-red-800/30">
          <CardHeader className="text-center pb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Acesso Negado
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-3">
              Você não tem permissões administrativas
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                A conta <strong>{user.email}</strong> não possui privilégios administrativos.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleSwitchAccount}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
              >
                Trocar de Conta
              </Button>
              
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Fazer Login como Usuário
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-blue-400/5"></div>
      
      <Card className="relative w-full max-w-lg bg-gradient-to-br from-white via-slate-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-purple-900/20 shadow-2xl border border-purple-100 dark:border-purple-800/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-blue-400/5 rounded-lg"></div>
        
        <CardHeader className="text-center relative z-10 pb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <Settings className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🔐 Login Administrativo
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-3">
            Acesso restrito para administradores do sistema
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 relative z-10">
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="group w-full bg-gradient-to-r from-white via-purple-50 to-blue-50 text-gray-700 border border-purple-200 hover:border-purple-300 hover:from-purple-50 hover:to-blue-100 flex items-center justify-center gap-3 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
            variant="outline"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            {loading ? "🔄 Conectando..." : "🛡️ Entrar como Admin"}
          </Button>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span>Acesso seguro e monitorado</span>
            </div>
            
            <div className="space-y-2">
              <Link 
                to="/login" 
                className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300"
              >
                <span>Login de usuário comum</span>
              </Link>
              
              <br />
              
              <Link 
                to="/" 
                className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 group"
              >
                <span className="group-hover:translate-x-1 transition-transform duration-300">←</span>
                <span>Voltar para o início</span>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;