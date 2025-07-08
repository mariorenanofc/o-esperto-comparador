
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, User, Clock } from 'lucide-react';
import { supabaseAdminService } from '@/services/supabase/adminService';
import { toast } from 'sonner';

interface ActiveUser {
  id: string;
  email: string;
  name: string | null;
  plan: string | null;
  last_activity: string | null;
  is_online: boolean | null;
}

export const ActiveUsersSection = () => {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching active users...');
      
      const data = await supabaseAdminService.getActiveUsers();
      console.log('Fetched active users:', data);
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
    
    // Set up interval to refresh active users every 30 seconds
    const interval = setInterval(fetchActiveUsers, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getPlanBadge = (plan: string | null) => {
    switch (plan) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'premium':
        return <Badge variant="default">Premium</Badge>;
      case 'free':
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  const getLastActivityText = (lastActivity: string | null) => {
    if (!lastActivity) return 'Nunca';
    
    const now = new Date();
    const activity = new Date(lastActivity);
    const diffInMinutes = Math.floor((now.getTime() - activity.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Usuários Ativos ({activeUsers.length})</CardTitle>
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
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-500 mt-2">Nenhum usuário ativo no momento.</p>
          </div>
        ) : (
          activeUsers.map((user) => (
            <div key={user.id} className="border rounded-lg p-4 space-y-3 bg-green-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {user.name || 'Nome não informado'}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="text-right space-y-1">
                  {getPlanBadge(user.plan)}
                  <Badge variant="default" className="bg-green-600 block">
                    Online
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                <span>Última atividade: {getLastActivityText(user.last_activity)}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
