import { AnalyticsSection } from "@/components/admin/AnalyticsSection";
import { CustomDashboard } from "@/components/analytics/CustomDashboard";
import { AlertsManager } from "@/components/analytics/AlertsManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function Analytics() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Métricas avançadas e análises do sistema
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard Personalizado</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <AnalyticsSection />
        </TabsContent>
        
        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Personalizado</CardTitle>
              <CardDescription>
                Crie e customize seus próprios widgets de análise
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user && <CustomDashboard userId={user.id} />}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Alertas</CardTitle>
              <CardDescription>
                Configure alertas automáticos baseados em métricas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertsManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
