import { AdminLayout } from "@/components/admin/AdminLayout";
import { NotificationSender } from "@/components/admin/NotificationSender";
import { EmailTemplatesList } from "@/components/notifications/EmailTemplatesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
            <EmailTemplatesList />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}