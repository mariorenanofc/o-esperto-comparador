import { AdminLayout } from "@/components/admin/AdminLayout";
import { NotificationSender } from "@/components/admin/NotificationSender";
import { EmailTemplatesList } from "@/components/notifications/EmailTemplatesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminNotifications() {
  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Notificações</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            Gerencie notificações e templates de email
          </p>
        </div>
        
        <Tabs defaultValue="sender" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="sender" className="text-xs sm:text-sm py-2">
              Enviar Notificações
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs sm:text-sm py-2">
              Templates de Email
            </TabsTrigger>
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