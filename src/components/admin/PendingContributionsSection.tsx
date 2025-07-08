
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
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
  quantity: number;
  unit: string;
}

export const PendingContributionsSection = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      console.log('Fetching all contributions for admin review...');
      
      const data = await supabaseAdminService.getAllContributions();
      console.log('Fetched contributions:', data);
      setContributions(data || []);
    } catch (error) {
      console.error('Error fetching contributions:', error);
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
      console.log('Admin approving contribution:', id);
      setActionLoading(id);
      
      await supabaseAdminService.approveContribution(id);
      toast.success("Contribuição aprovada com sucesso!");
      
      // Update local state to reflect the change
      setContributions(prev => 
        prev.map(contrib => 
          contrib.id === id 
            ? { ...contrib, verified: true }
            : contrib
        )
      );
      
    } catch (error) {
      console.error('Error approving contribution:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao aprovar contribuição: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      console.log('Admin rejecting contribution:', id);
      
      const confirmed = window.confirm('Tem certeza que deseja rejeitar e remover esta contribuição?');
      if (!confirmed) return;
      
      setActionLoading(id);
      
      await supabaseAdminService.rejectContribution(id);
      toast.success("Contribuição rejeitada e removida");
      
      // Remove from local state
      setContributions(prev => prev.filter(contrib => contrib.id !== id));
      
    } catch (error) {
      console.error('Error rejecting contribution:', error);
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

  const pendingContributions = contributions.filter(c => !c.verified);
  const approvedContributions = contributions.filter(c => c.verified);

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
    <div className="space-y-6">
      {/* Pending Contributions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contribuições Pendentes ({pendingContributions.length})</CardTitle>
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
          {pendingContributions.length === 0 ? (
            <p className="text-gray-500">Nenhuma contribuição pendente encontrada.</p>
          ) : (
            pendingContributions.map((contribution) => (
              <div key={contribution.id} className="border rounded-lg p-4 space-y-3 bg-yellow-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{contribution.product_name}</h3>
                    <p className="text-lg font-bold text-green-600">
                      R$ {contribution.price.toFixed(2)} ({contribution.quantity} {contribution.unit})
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
                </div>

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
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Approved Contributions */}
      {approvedContributions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contribuições Aprovadas ({approvedContributions.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {approvedContributions.map((contribution) => (
              <div key={contribution.id} className="border rounded-lg p-4 space-y-3 bg-green-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{contribution.product_name}</h3>
                    <p className="text-lg font-bold text-green-600">
                      R$ {contribution.price.toFixed(2)} ({contribution.quantity} {contribution.unit})
                    </p>
                    <p className="text-sm text-gray-500">
                      {contribution.store_name} - {contribution.city}, {contribution.state}
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
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
