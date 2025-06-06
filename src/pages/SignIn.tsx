
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    const { error } = await signInWithGoogle();
    
    if (error) {
      console.error('Google sign in error:', error);
      toast.error("Erro ao fazer login com Google. Tente novamente.");
    } else {
      toast.success("Redirecionando para o Google...");
    }
  };

  return (
    <div className="min-h-screen bg-app-gray flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-app-dark">Fazer Login</CardTitle>
          <CardDescription>
            Entre na sua conta para acessar todas as funcionalidades
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Google Login Button - Principal */}
          <Button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3 py-6 text-lg"
            variant="outline"
          >
            <Chrome className="w-6 h-6 text-blue-500" />
            {loading ? "Conectando..." : "Continuar com Google"}
          </Button>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:underline">
              Voltar para o início
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
