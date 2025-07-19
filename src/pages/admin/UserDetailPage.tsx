import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AdminRoute from "@/components/AdminRoute";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabaseAdminService } from "@/services/supabase/adminService";
import { useAuth } from "@/hooks/useAuth"; // <-- Importado para pegar o session/token
import { toast } from "sonner";
import { Loader2, ArrowLeft, Crown, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  plan: string | null;
  created_at: string;
  is_online: boolean | null;
  last_activity: string | null;
}

const UserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  // --- INÍCIO DA MODIFICAÇÃO AQUI ---
  const { user: currentUser, session } = useAuth(); // <-- Obtendo o session para pegar o token
  const accessToken = session?.access_token || ""; // Extrai o token de acesso
  // --- FIM DA MODIFICAÇÃO AQUI ---
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId]);

  const fetchUserProfile = async (id: string) => {
    setLoading(true);
    try {
      console.log(`Fetching user profile for: ${id}`);
      const users = await supabaseAdminService.getAllUsers();
      const foundUser = users.find((u) => u.id === id);

      if (foundUser) {
        setUserProfile(foundUser);
        console.log("User profile fetched:", foundUser);
      } else {
        toast.error("Usuário não encontrado.");
        navigate("/admin");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Erro ao carregar perfil do usuário.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (newPlan: string) => {
    if (!userProfile || !userId) return;

    if (currentUser && userId === currentUser.id) {
      toast.error("Você não pode alterar o seu próprio plano por aqui.");
      return;
    }

    try {
      setActionLoading("plan");
      await supabaseAdminService.updateUserPlan(userId, newPlan);
      toast.success(
        `Plano de ${
          userProfile.name || userProfile.email
        } atualizado para ${newPlan}.`
      );
      setUserProfile((prev) => (prev ? { ...prev, plan: newPlan } : null));
    } catch (error) {
      console.error("Error updating user plan:", error);
      toast.error("Erro ao atualizar plano.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userProfile || !userId) return;

    if (currentUser && userId === currentUser.id) {
      toast.error("Você não pode excluir a si mesmo.");
      return;
    }

    // --- INÍCIO DA MODIFICAÇÃO AQUI ---
    if (!accessToken) {
      // Verifica se há um token antes de prosseguir
      toast.error("Você não está autenticado. Faça login novamente.");
      setActionLoading(null);
      return;
    }
    // --- FIM DA MODIFICAÇÃO AQUI ---

    setActionLoading("delete"); // Ativa o loading

    try {
      console.log(`Iniciando deleção para o usuário: ${userId}`);
      // --- INÍCIO DA MODIFICAÇÃO AQUI ---
      await supabaseAdminService.deleteUserAuthAndProfile(userId, accessToken); // <-- Passando o token
      // --- FIM DA MODIFICAÇÃO AQUI ---

      toast.success(
        `Usuário ${userProfile.name || userProfile.email} excluído com sucesso.`
      );
      navigate("/admin/users");
    } catch (error) {
      console.error("Error deleting user:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao excluir usuário.";
      toast.error(`Erro ao excluir usuário: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getPlanBadge = (plan: string | null) => {
    switch (plan) {
      case "admin":
        return (
          <Badge variant="destructive">
            <Crown className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case "premium":
        return (
          <Badge variant="default" className="bg-blue-600">
            Premium
          </Badge>
        );
      case "pro":
        return (
          <Badge variant="default" className="bg-purple-600">
            Pro
          </Badge>
        );
      case "empresarial":
        return (
          <Badge variant="default" className="bg-green-600">
            Empresarial
          </Badge>
        );
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const formatLastActivity = (lastActivity: string | null) => {
    if (!lastActivity) return "Nunca";
    const date = new Date(lastActivity);
    return date.toLocaleString("pt-BR");
  };

  if (loading) {
    return (
      <AdminRoute>
        <Navbar />
        <div className="container mx-auto py-8 px-6 min-h-screen bg-app-gray dark:bg-gray-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
          <p className="ml-3 text-gray-600">
            Carregando detalhes do usuário...
          </p>
        </div>
      </AdminRoute>
    );
  }

  if (!userProfile) {
    return (
      <AdminRoute>
        <Navbar />
        <div className="container mx-auto py-8 px-6 min-h-screen bg-app-gray dark:bg-gray-900 text-center">
          <p className="text-red-500">
            Perfil do usuário não encontrado ou ID inválido.
          </p>
          <Button onClick={() => navigate("/admin/users")} className="mt-4">
            Voltar para Gerenciamento de Usuários
          </Button>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-app-gray dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto py-8 px-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Detalhes do Usuário
            </h1>
            <Button variant="outline" onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Admin
            </Button>
          </div>

          <Card className="mb-6 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {userProfile.name || "Nome não informado"}
              </CardTitle>
              <CardDescription>{userProfile.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ID:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {userProfile.id}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Plano Atual:
                </p>
                <p className="text-sm">{getPlanBadge(userProfile.plan)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Membro Desde:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(userProfile.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Última Atividade:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatLastActivity(userProfile.last_activity)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Seção de Gerenciamento de Plano */}
          <Card className="mb-6 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Gerenciar Plano</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Botões para mudar o plano */}
                {userProfile.plan !== "free" && (
                  <Button
                    variant="outline"
                    onClick={() => handleUpdatePlan("free")}
                    disabled={
                      actionLoading === "plan" ||
                      (currentUser && userProfile.id === currentUser.id)
                    }
                  >
                    Mudar para Gratuito
                  </Button>
                )}
                {userProfile.plan !== "premium" && (
                  <Button
                    variant="outline"
                    onClick={() => handleUpdatePlan("premium")}
                    disabled={
                      actionLoading === "plan" ||
                      (currentUser && userProfile.id === currentUser.id)
                    }
                  >
                    Mudar para Premium
                  </Button>
                )}
                {userProfile.plan !== "pro" && (
                  <Button
                    variant="outline"
                    onClick={() => handleUpdatePlan("pro")}
                    disabled={
                      actionLoading === "plan" ||
                      (currentUser && userProfile.id === currentUser.id)
                    }
                  >
                    Mudar para Pro
                  </Button>
                )}
                {userProfile.plan !== "empresarial" && (
                  <Button
                    variant="outline"
                    onClick={() => handleUpdatePlan("empresarial")}
                    disabled={
                      actionLoading === "plan" ||
                      (currentUser && userProfile.id === currentUser.id)
                    }
                  >
                    Mudar para Empresarial
                  </Button>
                )}
                {userProfile.plan !== "admin" && (
                  <Button
                    variant="outline"
                    onClick={() => handleUpdatePlan("admin")}
                    disabled={
                      actionLoading === "plan" ||
                      (currentUser && userProfile.id === currentUser.id)
                    }
                  >
                    Tornar Admin
                  </Button>
                )}
              </div>
              {actionLoading === "plan" && (
                <Loader2 className="w-5 h-5 animate-spin mx-auto mt-4" />
              )}
              {currentUser && userProfile.id === currentUser.id && (
                <p className="text-sm text-red-500 text-center">
                  Você não pode alterar o seu próprio plano aqui.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Seção de Exclusão de Usuário */}
          <Card className="bg-white dark:bg-gray-800 border-red-300">
            <CardHeader>
              <CardTitle className="text-red-600">Atenção!</CardTitle>
              <CardDescription>
                Excluir este usuário permanentemente. Esta ação não pode ser
                desfeita.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={
                      actionLoading === "delete" ||
                      (currentUser && userProfile.id === currentUser.id)
                    }
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Usuário
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Você tem certeza absoluta?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá
                      permanentemente o usuário **{userProfile.email}** e
                      removerá seus dados de nossos servidores.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteUser}
                      disabled={actionLoading === "delete"}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {actionLoading === "delete" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      {actionLoading === "delete"
                        ? "Excluindo..."
                        : "Confirmar Exclusão"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {currentUser && userProfile.id === currentUser.id && (
                <p className="text-sm text-red-500 mt-2 text-center">
                  Você não pode excluir a si mesmo.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Seção de Status de Consumo (TODO) */}
          <Card className="mt-6 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Status de Consumo do Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Esta seção será implementada para exibir o consumo detalhado do
                plano do usuário, como número de comparações realizadas/salvas e
                alertas de preço.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                (Funcionalidade em desenvolvimento)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRoute>
  );
};

export default UserDetailPage;
