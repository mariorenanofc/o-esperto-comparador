import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Send, 
  Users, 
  Crown, 
  Star, 
  Loader2,
  CheckCircle
} from "lucide-react";
import { supabaseAdminService } from "@/services/supabase/adminService";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { logger } from "@/lib/logger";

interface User {
  id: string;
  email: string;
  name: string | null;
  plan: string | null;
  is_online: boolean | null;
}

export const NotificationSender: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notificationType, setNotificationType] = useState("admin_announcement");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterOnline, setFilterOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { handleAsync } = useErrorHandler({ component: 'NotificationSender' });

  const fetchUsers = async () => {
    const result = await handleAsync(
      async () => {
        logger.info('Fetching users for notification');
        const usersData = await supabaseAdminService.getAllUsers();
        logger.info('Users fetched', { count: usersData.length });
        return usersData;
      },
      { action: 'fetch_users' },
      { showToast: true, severity: 'low' }
    );

    if (result) setUsers(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    if (filterPlan !== "all" && user.plan !== filterPlan) {
      return false;
    }
    if (filterOnline && !user.is_online) {
      return false;
    }
    return true;
  });

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      logger.warn('Notification send attempted without title or message');
      return;
    }

    if (selectedUsers.length === 0) {
      logger.warn('Notification send attempted without users');
      return;
    }

    setSending(true);
    await handleAsync(
      async () => {
        logger.info('Sending notification', { 
          recipients: selectedUsers.length, 
          type: notificationType 
        });
        
        await supabaseAdminService.sendNotification(
          selectedUsers,
          title.trim(),
          message.trim(),
          notificationType
        );

        logger.info('Notification sent successfully', { 
          recipients: selectedUsers.length 
        });

        // Reset form
        setTitle("");
        setMessage("");
        setSelectedUsers([]);
        setNotificationType("admin_announcement");
      },
      { action: 'send_notification' },
      { showToast: true, severity: 'medium' }
    );
    setSending(false);
  };

  const getPlanBadge = (plan: string | null) => {
    switch (plan) {
      case "admin":
        return <Badge variant="destructive"><Crown className="w-3 h-3 mr-1" />Admin</Badge>;
      case "premium":
        return <Badge className="bg-blue-600">Premium</Badge>;
      case "pro":
        return <Badge className="bg-purple-600"><Star className="w-3 h-3 mr-1" />Pro</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enviar Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Carregando usuários...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulário de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Enviar Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da notificação"
                maxLength={100}
              />
            </div>
            
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin_announcement">Anúncio Administrativo</SelectItem>
                  <SelectItem value="system_maintenance">Manutenção do Sistema</SelectItem>
                  <SelectItem value="feature_update">Atualização de Recurso</SelectItem>
                  <SelectItem value="security_alert">Alerta de Segurança</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Conteúdo da notificação"
              rows={4}
              maxLength={500}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {message.length}/500 caracteres
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Selecionar Destinatários ({selectedUsers.length}/{filteredUsers.length})
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedUsers.length === filteredUsers.length ? "Desmarcar Todos" : "Selecionar Todos"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-4 items-end">
            <div>
              <Label htmlFor="plan-filter">Filtrar por Plano</Label>
              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="online-filter"
                checked={filterOnline}
                onCheckedChange={(checked) => setFilterOnline(checked === true)}
              />
              <Label htmlFor="online-filter">Apenas usuários online</Label>
            </div>
          </div>

          {/* Lista de Usuários */}
          <div className="border rounded-md max-h-64 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nenhum usuário encontrado com os filtros aplicados
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md"
                  >
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {user.name || "Sem nome"}
                        </span>
                        {getPlanBadge(user.plan)}
                        {user.is_online && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botão de Envio */}
          <div className="flex justify-end">
            <Button
              onClick={handleSendNotification}
              disabled={sending || selectedUsers.length === 0 || !title.trim() || !message.trim()}
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar para {selectedUsers.length} usuário{selectedUsers.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};