import { AdminLayout } from "@/components/admin/AdminLayout";
import { NotificationSender } from "@/components/admin/NotificationSender";
import { EmailTemplateEditor } from "@/components/notifications/EmailTemplateEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminNotifications() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">
            Gerencie notificações e templates de email
          </p>
        </div>
        
        <Tabs defaultValue="sender" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sender">Enviar Notificações</TabsTrigger>
            <TabsTrigger value="templates">Templates de Email</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sender" className="space-y-4">
            <NotificationSender />
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Templates de Email</CardTitle>
                <CardDescription>
                  Crie e gerencie templates para notificações por email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmailTemplateEditor 
                  onSave={(template) => {
                    console.log('Template saved:', template);
                  }}
                  onTest={(template) => {
                    console.log('Template test:', template);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}