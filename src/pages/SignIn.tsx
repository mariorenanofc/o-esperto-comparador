import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Chrome } from "lucide-react";

const SignIn: React.FC = () => {
  const { signInWithGoogle, loading, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      toast.loading("Preparando login...");
      const { error } = await signInWithGoogle();

      if (error) {
        console.error("Google sign in error:", error);
        toast.dismiss();
        toast.error("Erro ao fazer login com Google. Tente novamente.");
      } else {
        toast.dismiss();
        toast.success("Redirecionando para o Google...");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Erro inesperado. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5"></div>
      
      <Card className="relative w-full max-w-lg bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-gray-800 dark:via-gray-700 dark:to-blue-900/20 shadow-2xl border border-blue-100 dark:border-blue-800/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-lg"></div>
        
        <CardHeader className="text-center relative z-10 pb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl font-bold">🔐</span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ✨ Fazer Login ✨
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-3">
            Entre na sua conta para acessar todas as funcionalidades e economizar ainda mais
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 relative z-10">
          {/* Google Login Button - Principal */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="group w-full bg-gradient-to-r from-white via-blue-50 to-purple-50 text-gray-700 border border-blue-200 hover:border-blue-300 hover:from-blue-50 hover:to-purple-100 flex items-center justify-center gap-3 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
            variant="outline"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Chrome className="w-5 h-5 text-white" />
            </div>
            {loading ? "🔄 Conectando..." : "🚀 Continuar com Google"}
          </Button>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">✓</span>
              </div>
              <span>Acesso rápido e seguro</span>
            </div>
            
            <Link 
              to="/" 
              className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 group"
            >
              <span className="group-hover:translate-x-1 transition-transform duration-300">←</span>
              <span>Voltar para o início</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
