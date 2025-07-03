
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, User, Clock } from 'lucide-react';
import { supabaseAdminService } from '@/services/supabase/adminService';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  created_at: string;
  last_activity: string | null;
  is_online: boolean;
}

export const ActiveUsersSection = () => {
  const [activeUsers, setActiveUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchActiveUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching active users...');
      
      const users = await supabaseAdminService.getActiveUsers();
      console.log('Active users fetched:', users.length);
      setActiveUsers(users);
    } catch (error) {
      console.error('Error fetching active users:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários ativos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveUsers();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchActiveUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatLastActivity = (lastActivity: string | null) => {
    if (!lastActivity) return 'Nunca';
    
    const date = new Date(lastActivity);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} dias atrás`;
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'empresarial': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Usuários Ativos
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchActiveUsers}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p>Carregando usuários ativos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Usuários Ativos ({activeUsers.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchActiveUsers}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeUsers.length === 0 ? (
          <p className="text-gray-500">Nenhum usuário ativo no momento.</p>
        ) : (
          <div className="grid gap-4">
            {activeUsers.map((user) => (
              <div key={user.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {user.name || 'Usuário sem nome'}
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getPlanColor(user.plan)}>
                        {user.plan || 'free'}
                      </Badge>
                      {user.is_online && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Online
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatLastActivity(user.last_activity)}
                    </div>
                    <p className="mt-1">
                      Cadastrado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
