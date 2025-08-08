
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { RefreshCw, UserCheck, Clock } from 'lucide-react';
import { supabaseAdminService } from '@/services/supabase/adminService';
import { toast } from 'sonner';

interface ActiveUser {
  id: string;
  email: string;
  name: string | null;
  plan: string | null;
  is_online: boolean | null;
  last_activity: string | null;
}

export const ActiveUsersSection = () => {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching active users...');
      
      const data = await supabaseAdminService.getActiveUsers();
      console.log('Active users data received:', data);
      setActiveUsers(data || []);
    } catch (error) {
      console.error('Error fetching active users:', error);
      toast.error("Erro ao carregar usuários ativos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveUsers();
    
    // Auto refresh every 15 seconds for more real-time updates
    const interval = setInterval(fetchActiveUsers, 15000);
    return () => clearInterval(interval);
  }, []);

  const getPlanBadge = (plan: string | null) => {
    switch (plan) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'premium':
        return <Badge variant="default" className="bg-blue-600">Premium</Badge>;
      case 'pro':
        return <Badge variant="default" className="bg-purple-600">Pro</Badge>;
      case 'empresarial':
        return <Badge variant="default" className="bg-green-600">Empresarial</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const formatLastActivity = (lastActivity: string | null) => {
    if (!lastActivity) return 'Nunca';
    
    const date = new Date(lastActivity);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usuários Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando usuários ativos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Usuários Ativos</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchActiveUsers}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{activeUsers.length}</div>
            <p className="text-xs text-muted-foreground">Usuários Online</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {activeUsers.filter(u => u.plan === 'premium' || u.plan === 'pro' || u.plan === 'empresarial').length}
            </div>
            <p className="text-xs text-muted-foreground">Usuários Premium Online</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {activeUsers.filter(u => u.plan === 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground">Administradores Online</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          {activeUsers.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-500 mt-2">Nenhum usuário ativo no momento.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Última Atividade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name || 'Nome não informado'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getPlanBadge(user.plan)}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatLastActivity(user.last_activity)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-600">
                        <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                        Online
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
