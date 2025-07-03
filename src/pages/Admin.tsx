
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import AdminRoute from "@/components/AdminRoute";
import { PendingContributionsSection } from "@/components/admin/PendingContributionsSection";
import { FeedbackSection } from "@/components/admin/FeedbackSection";
import { UserManagementSection } from "@/components/admin/UserManagementSection";
import { AnalyticsSection } from "@/components/admin/AnalyticsSection";
import { ActiveUsersSection } from "@/components/admin/ActiveUsersSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BarChart3, MessageSquare, Clock, UserCheck } from "lucide-react";

const Admin: React.FC = () => {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-app-gray">
        <Navbar />
        <div className="container mx-auto py-8 px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Dashboard Administrativo
            </h1>
            <p className="text-gray-600">
              Controle completo da plataforma - Gerenciamento, Analytics e Moderação
            </p>
          </div>
          
          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="active-users" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Ativos
              </TabsTrigger>
              <TabsTrigger value="contributions" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Contribuições
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Feedback
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsSection />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UserManagementSection />
            </TabsContent>

            <TabsContent value="active-users" className="space-y-6">
              <ActiveUsersSection />
            </TabsContent>

            <TabsContent value="contributions" className="space-y-6">
              <PendingContributionsSection />
            </TabsContent>

            <TabsContent value="feedback" className="space-y-6">
              <FeedbackSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminRoute>
  );
};

export default Admin;
