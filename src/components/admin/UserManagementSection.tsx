
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Ban, CheckCircle, Crown, Search, RefreshCw } from 'lucide-react';
import { supabaseAdminService } from '@/services/supabase/adminService';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  created_at: string;
  is_blocked: boolean;
  last_sign_in_at: string | null;
}

export const UserManagementSection = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await supabaseAdminService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (planFilter !== 'all') {
      filtered = filtered.filter(user => user.plan === planFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, planFilter]);

  const handleBlockUser = async (userId: string, block: boolean) => {
    try {
      await supabaseAdminService.blockUser(userId, block);
      toast({
        title: "Sucesso",
        description: `Usuário ${block ? 'bloqueado' : 'desbloqueado'} com sucesso`,
      });
      fetchUsers();
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do usuário",
        variant: "destructive",
      });
    }
  };

  const handleChangePlan = async (userId: string, newPlan: string) => {
    try {
      await supabaseAdminService.updateUserPlan(userId, newPlan);
      toast({
        title: "Sucesso",
        description: "Plano do usuário atualizado com sucesso",
      });
      fetchUsers();
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar plano do usuário",
        variant: "destructive",
      });
    }
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      premium: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      empresarial: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={colors[plan as keyof typeof colors] || colors.free}>
        {plan === 'empresarial' ? 'Empresarial' : plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciamento de Usuários
          </CardTitle>
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
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciamento de Usuários ({filteredUsers.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por email ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os planos</SelectItem>
              <SelectItem value="free">Gratuito</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="empresarial">Empresarial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {filteredUsers.length === 0 ? (
          <p className="text-gray-500">Nenhum usuário encontrado.</p>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{user.name || 'Nome não informado'}</h3>
                      {user.is_blocked && (
                        <Badge variant="destructive">Bloqueado</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Registrado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    {user.last_sign_in_at && (
                      <p className="text-xs text-gray-500">
                        Último acesso: {new Date(user.last_sign_in_at).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <div className="text-right space-y-2">
                    {getPlanBadge(user.plan)}
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Select
                    value={user.plan}
                    onValueChange={(newPlan) => handleChangePlan(user.id, newPlan)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Gratuito</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="empresarial">Empresarial</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {user.is_blocked ? (
                    <Button
                      onClick={() => handleBlockUser(user.id, false)}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Desbloquear
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleBlockUser(user.id, true)}
                      variant="destructive"
                      size="sm"
                    >
                      <Ban className="w-4 h-4 mr-1" />
                      Bloquear
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
