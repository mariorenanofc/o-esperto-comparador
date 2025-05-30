
import React from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallbackMessage = "Você precisa estar logado para acessar esta página." 
}) => {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen bg-app-gray flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-app-dark mb-4">
              Acesso Restrito
            </h2>
            <p className="text-gray-600 mb-6">
              {fallbackMessage}
            </p>
            <SignInButton mode="modal">
              <Button className="bg-app-green hover:bg-green-600 text-white">
                Fazer Login
              </Button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
    </>
  );
};

export default ProtectedRoute;
