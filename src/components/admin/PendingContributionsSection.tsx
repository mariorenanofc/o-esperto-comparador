
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Clock } from "lucide-react";

interface PriceContribution {
  id: string;
  price: number;
  status: string;
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

const PendingContributionsSection: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: contributions, isLoading } = useQuery({
    queryKey: ['admin-contributions'],
    queryFn: async (): Promise<PriceContribution[]> => {
      const response = await fetch('/api/admin/contributions');
      if (!response.ok) {
        throw new Error('Erro ao buscar contribuições');
      }
      return response.json();
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (contributionId: string) => {
      const response = await fetch(`/api/admin/contributions/${contributionId}/approve`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Erro ao aprovar contribuição');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Contribuição aprovada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['admin-contributions'] });
    },
    onError: () => {
      toast.error('Erro ao aprovar contribuição');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (contributionId: string) => {
      const response = await fetch(`/api/admin/contributions/${contributionId}/reject`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Erro ao rejeitar contribuição');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Contribuição rejeitada');
      queryClient.invalidateQueries({ queryKey: ['admin-contributions'] });
    },
    onError: () => {
      toast.error('Erro ao rejeitar contribuição');
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><Check className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando contribuições...</p>
      </div>
    );
  }

  const pendingContributions = contributions?.filter(c => c.status === 'pending') || [];
  const allContributions = contributions || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Contribuições</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allContributions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingContributions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Aprovadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {allContributions.filter(c => c.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contribuições de Preço</CardTitle>
        </CardHeader>
        <CardContent>
          {allContributions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma contribuição encontrada</p>
          ) : (
            <div className="space-y-4">
              {allContributions.map((contribution) => (
                <div
                  key={contribution.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-semibold">
                        {contribution.product.name} ({contribution.product.quantity} {contribution.product.unit})
                      </h3>
                      <p className="text-sm text-gray-600">
                        Loja: {contribution.store.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Contribuidor: {contribution.user.name || contribution.user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(contribution.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-xl font-bold text-green-600">
                        R$ {Number(contribution.price).toFixed(2)}
                      </div>
                      {getStatusBadge(contribution.status)}
                    </div>
                  </div>
                  
                  {contribution.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(contribution.id)}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectMutation.mutate(contribution.id)}
                        disabled={rejectMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingContributionsSection;
