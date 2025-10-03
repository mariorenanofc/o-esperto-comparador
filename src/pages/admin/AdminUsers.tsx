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
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <AdminBreadcrumbs />
      
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 sm:mb-2">
          Gerenciamento de Usuários
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
          Gerencie usuários, monitore atividade em tempo real e exporte relatórios
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Gerenciamento Avançado</span>
            <span className="sm:hidden">Gerenciar</span>
          </TabsTrigger>
          <TabsTrigger value="presence" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
            <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Presença em Tempo Real</span>
            <span className="sm:hidden">Presença</span>
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