
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdminService } from '@/services/supabase/adminService';
import { toast } from 'sonner';

interface Contribution {
  id: string;
  price: number;
  created_at: string;
  verified: boolean;
  user_id: string;
  contributor_name: string;
  product_name: string;
  store_name: string;
  city: string;
  state: string;
}

export const PendingContributionsSection = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      console.log('Fetching contributions from daily_offers...');
      
      const { data, error } = await supabase
        .from('daily_offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contributions:', error);
        throw error;
      }

      console.log('Fetched contributions:', data);
      setContributions(data || []);
    } catch (error) {
      console.error('Erro ao buscar contribuições:', error);
      toast.error("Erro ao carregar contribuições");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      console.log('=== ADMIN APPROVING CONTRIBUTION ===');
      console.log('Contribution ID:', id);
      
      setActionLoading(id);
      
      await supabaseAdminService.approveContribution(id);
      
      toast.success("Contribuição aprovada com sucesso!");
      await fetchContributions(); // Recarregar a lista
      
    } catch (error) {
      console.error('=== ERROR APPROVING CONTRIBUTION ===');
      console.error('Error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao aprovar contribuição: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      console.log('=== ADMIN REJECTING CONTRIBUTION ===');
      console.log('Contribution ID:', id);
      
      const confirmed = window.confirm('Tem certeza que deseja rejeitar e remover esta contribuição?');
      if (!confirmed) return;
      
      setActionLoading(id);
      
      await supabaseAdminService.rejectContribution(id);
      
      toast.success("Contribuição rejeitada e removida");
      await fetchContributions(); // Recarregar a lista
      
    } catch (error) {
      console.error('=== ERROR REJECTING CONTRIBUTION ===');
      console.error('Error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao rejeitar contribuição: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (verified: boolean) => {
    if (verified) {
      return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-4 h-4 mr-1" />Aprovada</Badge>;
    } else {
      return <Badge variant="secondary"><Clock className="w-4 h-4 mr-1" />Pendente</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contribuições de Preços</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando contribuições...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Contribuições de Preços ({contributions.length})</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchContributions}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {contributions.length === 0 ? (
          <p className="text-gray-500">Nenhuma contribuição encontrada.</p>
        ) : (
          contributions.map((contribution) => (
            <div key={contribution.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{contribution.product_name}</h3>
                  <p className="text-lg font-bold text-green-600">
                    R$ {contribution.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {contribution.store_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {contribution.city}, {contribution.state}
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(contribution.verified)}
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(contribution.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Contribuidor:</strong> {contribution.contributor_name}</p>
                <p><strong>ID:</strong> {contribution.id}</p>
              </div>

              {!contribution.verified && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(contribution.id)}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                    disabled={actionLoading === contribution.id}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {actionLoading === contribution.id ? 'Aprovando...' : 'Aprovar'}
                  </Button>
                  <Button
                    onClick={() => handleReject(contribution.id)}
                    variant="destructive"
                    size="sm"
                    disabled={actionLoading === contribution.id}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    {actionLoading === contribution.id ? 'Rejeitando...' : 'Rejeitar'}
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
