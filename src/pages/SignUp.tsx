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

const SignUp: React.FC = () => {
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
      toast.loading("Preparando cadastro...");
      const { error } = await signInWithGoogle();

      if (error) {
        console.error("Google sign in error:", error);
        toast.dismiss();
        toast.error("Erro ao criar conta com Google. Tente novamente.");
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-green-400/5"></div>
      
      <Card className="relative w-full max-w-lg bg-gradient-to-br from-white via-slate-50 to-emerald-50 dark:from-gray-800 dark:via-gray-700 dark:to-emerald-900/20 shadow-2xl border border-emerald-100 dark:border-emerald-800/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-green-400/5 rounded-lg"></div>
        
        <CardHeader className="text-center relative z-10 pb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl font-bold">🌟</span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            ✨ Criar Conta ✨
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-3">
            Cadastre-se para acessar todas as funcionalidades e começar a economizar hoje mesmo
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 relative z-10">
          {/* Google Login Button - Principal */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="group w-full bg-gradient-to-r from-white via-emerald-50 to-green-50 text-gray-700 border border-emerald-200 hover:border-emerald-300 hover:from-emerald-50 hover:to-green-100 flex items-center justify-center gap-3 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
            variant="outline"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Chrome className="w-5 h-5 text-white" />
            </div>
            {loading ? "🔄 Criando conta..." : "🚀 Criar conta com Google"}
          </Button>

          <div className="text-center space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">⚡</span>
                </div>
                <span>Rápido</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">🔒</span>
                </div>
                <span>Seguro</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link 
                to="/sign-in" 
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold transition-colors duration-300 hover:underline"
              >
                Faça login aqui
              </Link>
            </p>
            
            <Link 
              to="/" 
              className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 group"
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

export default SignUp;
