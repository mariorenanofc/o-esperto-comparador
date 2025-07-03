
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Clock } from 'lucide-react';
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
      console.log('Active users fetched:', users);
      setActiveUsers(users);
    } catch (error) {
      console.error('Erro ao buscar usuários ativos:', error);
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
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchActiveUsers, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatLastActivity = (lastActivity: string | null) => {
    if (!lastActivity) return 'Nunca';
    
    const now = new Date();
    const activity = new Date(lastActivity);
    const diffMinutes = Math.floor((now.getTime() - activity.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes < 60) return `${diffMinutes} min atrás`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} dias atrás`;
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'free': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
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
            <Users className="w-5 h-5" />
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
          <div className="space-y-3">
            {activeUsers.map((user) => (
              <div key={user.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {user.name || 'Nome não informado'}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={getPlanColor(user.plan)}>
                      {user.plan}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Online
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Última atividade: {formatLastActivity(user.last_activity)}</span>
                </div>
                
                <div className="text-xs text-gray-400">
                  Membro desde: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
