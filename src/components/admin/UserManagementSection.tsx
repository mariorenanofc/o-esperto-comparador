import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, User, Crown, Calendar } from "lucide-react";
import { supabaseAdminService } from "@/services/supabase/adminService";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  plan: string | null;
  created_at: string;
  is_online: boolean | null;
  last_activity: string | null;
}

export const UserManagementSection = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Fetching all users...");

      const data = await supabaseAdminService.getAllUsers();
      console.log("Users data received:", data);
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    
    // Auto refresh every 20 seconds for real-time status updates
    const interval = setInterval(fetchUsers, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdatePlan = async (userId: string, newPlan: string) => {
    if (currentUser && userId === currentUser.id) {
      toast.error("Você não pdoe alterar o seu próprio plano por aqui.");
      return;
    }

    try {
      setActionLoading(userId);
      console.log("Updating user plan:", { userId, newPlan });

      await supabaseAdminService.updateUserPlan(userId, newPlan);
      toast.success(`Plano atualizado para ${newPlan}`);

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, plan: newPlan } : user
        )
      );
    } catch (error) {
      console.error("Error updating user plan:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao atualizar plano: ${errorMessage}`);
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

  const getStatusBadge = (isOnline: boolean | null) => {
    return isOnline ? (
      <Badge variant="default" className="bg-green-600">
        Online
      </Badge>
    ) : (
      <Badge variant="outline">Offline</Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando usuários...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ... (cabeçalho e cards de resumo) */}

      <Card>
        <CardHeader>
          <CardTitle>Usuários Registrados ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-500 mt-2">Nenhum usuário encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Ações</TableHead>{" "}
                  {/* Adicione uma coluna para ações se os botões não estiverem na linha clicável */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" // Torna a linha clicável
                    onClick={() => navigate(`/admin/users/${user.id}`)} // <-- ADICIONE ESTA LINHA
                  >
                    <TableCell className="font-medium">
                      {user.name || "Nome não informado"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getPlanBadge(user.plan)}</TableCell>
                    <TableCell>{getStatusBadge(user.is_online)}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(user.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* Botão de "Ver Detalhes" ou icone de edit, se preferir */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          // Impede que o clique na linha também ative o botão
                          e.stopPropagation(); // Previne que o evento de clique da linha se propague
                          navigate(`/admin/users/${user.id}`);
                        }}
                      >
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
