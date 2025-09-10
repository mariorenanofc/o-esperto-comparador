import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { UserManagementAdvanced } from "@/components/admin/UserManagementAdvanced";
import { RealtimePresenceHardened } from "@/components/admin/RealtimePresenceHardened";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Activity, 
  Filter,
  UserCheck
} from "lucide-react";

const AdminUsers: React.FC = () => {
  return (
    <div className="space-y-8">
      <AdminBreadcrumbs />
      
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Gerenciamento de Usuários
        </h1>
        <p className="text-muted-foreground">
          Gerencie usuários, monitore atividade em tempo real e exporte relatórios
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Gerenciamento Avançado
          </TabsTrigger>
          <TabsTrigger value="presence" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Presença em Tempo Real
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagementAdvanced />
        </TabsContent>

        <TabsContent value="presence">
          <RealtimePresenceHardened />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUsers;