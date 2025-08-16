import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import AdminRoute from "@/components/AdminRoute";
import { PendingContributionsSection } from "@/components/admin/PendingContributionsSection";
import { FeedbackSection } from "@/components/admin/FeedbackSection";
import { UserManagementSection } from "@/components/admin/UserManagementSection";
import { AnalyticsSection } from "@/components/admin/AnalyticsSection";
import { ActiveUsersSection } from "@/components/admin/ActiveUsersSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  BarChart3,
  MessageSquare,
  Clock,
  UserCheck,
} from "lucide-react";

const Admin: React.FC = () => {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-app-gray dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto py-4 md:py-8 px-4 md:px-6">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Dashboard Administrativo
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Controle completo da plataforma - Gerenciamento, Analytics e
              Moderação
            </p>
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            {/* Responsivo: Scroll horizontal em telas pequenas */}
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-5 min-w-[600px] md:min-w-0">
                <TabsTrigger
                  value="analytics"
                  className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                >
                  <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">📊</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                  <Users className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Usuários</span>
                  <span className="sm:hidden">👥</span>
                </TabsTrigger>
                <TabsTrigger
                  value="active-users"
                  className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                >
                  <UserCheck className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Ativos</span>
                  <span className="sm:hidden">🟢</span>
                </TabsTrigger>
                <TabsTrigger
                  value="contributions"
                  className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                >
                  <Clock className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Contribuições</span>
                  <span className="sm:hidden">⏰</span>
                </TabsTrigger>
                <TabsTrigger value="feedback" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                  <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Feedback</span>
                  <span className="sm:hidden">💬</span>
                </TabsTrigger>
              </TabsList>
            </div>

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
