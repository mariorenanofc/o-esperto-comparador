import React, { useState, useEffect } from "react";
import { PlatformStatsCards } from "@/components/admin/PlatformStatsCards";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AnalyticsSection } from "@/components/admin/AnalyticsSection";
import { ActiveUsersSection } from "@/components/admin/ActiveUsersSection";
import { PendingContributionsSection } from "@/components/admin/PendingContributionsSection";
import { ApiKeysManager } from "@/components/admin/ApiKeysManager";
import { supabaseAdminService } from "@/services/supabase/adminService";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [dbUsage, setDbUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [analyticsData, dbUsageData] = await Promise.all([
        supabaseAdminService.getAnalytics(),
        supabaseAdminService.getDatabaseUsage().catch(() => null),
      ]);

      setAnalytics(analyticsData);
      setDbUsage(dbUsageData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Carregando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminBreadcrumbs />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard Administrativo
          </h1>
          <p className="text-muted-foreground">
            Visão geral da plataforma e métricas principais
          </p>
        </div>
      </div>

      <PlatformStatsCards analytics={analytics} dbUsage={dbUsage} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="api">API Pública</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:col-span-1">
              <AnalyticsSection />
            </div>
            <div className="lg:col-span-1">
              <ActiveUsersSection />
            </div>
            <div className="lg:col-span-2">
              <PendingContributionsSection />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api">
          <ApiKeysManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;