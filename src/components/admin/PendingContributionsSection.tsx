
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { mockApiService } from '@/services/mockApiService';
import { useToast } from '@/hooks/use-toast';

interface Contribution {
  id: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  product: {
    name: string;
    quantity: number;
    unit: string;
  };
  store: {
    name: string;
  };
}

export const PendingContributionsSection = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const data = await mockApiService.getPendingContributions();
      setContributions(data);
    } catch (error) {
      console.error('Erro ao buscar contribuições:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar contribuições pendentes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await mockApiService.approveContribution(id);
      toast({
        title: "Sucesso",
        description: "Contribuição aprovada com sucesso",
      });
      fetchContributions(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao aprovar contribuição:', error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar contribuição",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await mockApiService.rejectContribution(id);
      toast({
        title: "Sucesso",
        description: "Contribuição rejeitada",
      });
      fetchContributions(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao rejeitar contribuição:', error);
      toast({
        title: "Erro",
        description: "Erro ao rejeitar contribuição",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-4 h-4 mr-1" />Pendente</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="w-4 h-4 mr-1" />Aprovada</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-4 h-4 mr-1" />Rejeitada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contribuições Pendentes</CardTitle>
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
        <CardTitle>Contribuições Pendentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contributions.length === 0 ? (
          <p className="text-gray-500">Nenhuma contribuição pendente encontrada.</p>
        ) : (
          contributions.map((contribution) => (
            <div key={contribution.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{contribution.product.name}</h3>
                  <p className="text-sm text-gray-600">
                    {contribution.product.quantity} {contribution.product.unit}
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    R$ {contribution.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {contribution.store.name}
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(contribution.status)}
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(contribution.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Usuário:</strong> {contribution.user.name}</p>
                <p><strong>Email:</strong> {contribution.user.email}</p>
              </div>

              {contribution.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(contribution.id)}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    onClick={() => handleReject(contribution.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Rejeitar
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
