import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const NotAuthorized: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSwitchAccount = async () => {
    try {
      await signOut();
      toast.success("Conta desconectada. Faça login com uma conta administrativa.");
    } catch (error) {
      toast.error("Erro ao desconectar conta.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-r from-red-400/5 to-orange-400/5"></div>
      
      <Card className="relative w-full max-w-lg bg-gradient-to-br from-white via-slate-50 to-red-50 dark:from-gray-800 dark:via-gray-700 dark:to-red-900/20 shadow-2xl border border-red-100 dark:border-red-800/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-red-400/5 to-orange-400/5 rounded-lg"></div>
        
        <CardHeader className="text-center relative z-10 pb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            🚫 Acesso Negado
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-3">
            Você não possui privilégios administrativos
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                  Permissão Insuficiente
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  A conta <strong>{user?.email}</strong> não tem acesso ao painel administrativo.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleSwitchAccount}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 font-semibold"
            >
              🔄 Trocar de Conta
            </Button>
            
            <Link to="/login">
              <Button variant="outline" className="w-full py-3">
                👤 Login de Usuário
              </Button>
            </Link>
            
            <Link to="/">
              <Button variant="ghost" className="w-full py-3">
                🏠 Voltar ao Início
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Se você acredita que deveria ter acesso administrativo, 
              entre em contato com o suporte.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotAuthorized;