import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Shield } from "lucide-react";
import { UserManagementSection } from "@/components/admin/UserManagementSection";
import { ActiveUsersSection } from "@/components/admin/ActiveUsersSection";

const AdminUsers: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Usuários</h1>
        <p className="text-muted-foreground">
          Administre usuários, permissões e status de conta
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">1,234</div>
            <p className="text-xs text-muted-foreground">
              +12% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Novos Usuários
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">89</div>
            <p className="text-xs text-muted-foreground">
              +23% desde a semana passada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Premium
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">156</div>
            <p className="text-xs text-muted-foreground">
              +8% desde o mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Management */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuários</CardTitle>
              <CardDescription>
                Gerencie contas de usuário, planos e permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagementSection />
            </CardContent>
          </Card>
        </div>

        {/* Active Users Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Usuários Online</CardTitle>
              <CardDescription>
                Usuários atualmente ativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActiveUsersSection />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;