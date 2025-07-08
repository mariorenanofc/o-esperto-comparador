
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, User, Crown, Shield } from 'lucide-react';
import { supabaseAdminService } from '@/services/supabase/adminService';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  plan: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_activity: string | null;
  is_online: boolean | null;
}

export const UserManagementSection = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching all users...');
      
      const data = await supabaseAdminService.getAllUsers();
      console.log('Fetched users:', data);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateUserPlan = async (userId: string, newPlan: string) => {
    try {
      setActionLoading(userId);
      console.log('Updating user plan:', { userId, newPlan });
      
      await supabaseAdminService.updateUserPlan(userId, newPlan);
      toast.success(`Plano do usuário atualizado para ${newPlan}`);
      
      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, plan: newPlan }
            : user
        )
      );
      
    } catch (error) {
      console.error('Error updating user plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao atualizar plano: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getPlanBadge = (plan: string | null) => {
    switch (plan) {
      case 'admin':
        return <Badge variant="destructive"><Crown className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'premium':
        return <Badge variant="default"><Shield className="w-3 h-3 mr-1" />Premium</Badge>;
      case 'free':
      default:
        return <Badge variant="secondary"><User className="w-3 h-3 mr-1" />Free</Badge>;
    }
  };

  const getStatusBadge = (isOnline: boolean | null) => {
    if (isOnline) {
      return <Badge variant="default" className="bg-green-600">Online</Badge>;
    } else {
      return <Badge variant="secondary">Offline</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando usuários...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gerenciamento de Usuários ({users.length})</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.length === 0 ? (
          <p className="text-gray-500">Nenhum usuário encontrado.</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{user.name || 'Nome não informado'}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400">ID: {user.id}</p>
                </div>
                <div className="text-right space-y-1">
                  {getPlanBadge(user.plan)}
                  {getStatusBadge(user.is_online)}
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Criado em:</strong> {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}</p>
                <p><strong>Última atividade:</strong> {user.last_activity ? new Date(user.last_activity).toLocaleDateString('pt-BR') : 'N/A'}</p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => handleUpdateUserPlan(user.id, 'free')}
                  variant="outline"
                  size="sm"
                  disabled={actionLoading === user.id || user.plan === 'free'}
                >
                  <User className="w-4 h-4 mr-1" />
                  Free
                </Button>
                <Button
                  onClick={() => handleUpdateUserPlan(user.id, 'premium')}
                  variant="outline"
                  size="sm"
                  disabled={actionLoading === user.id || user.plan === 'premium'}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Premium
                </Button>
                <Button
                  onClick={() => handleUpdateUserPlan(user.id, 'admin')}
                  variant="outline"
                  size="sm"
                  disabled={actionLoading === user.id || user.plan === 'admin'}
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Admin
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
