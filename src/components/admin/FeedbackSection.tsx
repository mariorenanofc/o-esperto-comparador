
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { contributionService, UserFeedback } from '@/services/contributionService';
import { useToast } from '@/hooks/use-toast';

export const FeedbackSection = () => {
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      console.log('Fetching feedbacks...');
      
      const data = await contributionService.getAllFeedbacks();
      console.log('Feedbacks fetched:', data.length);
      setFeedbacks(data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar feedbacks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleUpdateStatus = async (feedbackId: string, status: 'in-review' | 'implemented') => {
    try {
      setActionLoading(feedbackId);
      await contributionService.updateFeedbackStatus(feedbackId, status);
      
      toast({
        title: "Sucesso",
        description: `Status atualizado para ${status === 'in-review' ? 'Em Análise' : 'Implementado'}`,
      });
      
      fetchFeedbacks();
    } catch (error) {
      console.error('Error updating feedback status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline"><Clock className="w-4 h-4 mr-1" />Aberto</Badge>;
      case 'in-review':
        return <Badge variant="secondary"><AlertCircle className="w-4 h-4 mr-1" />Em Análise</Badge>;
      case 'implemented':
        return <Badge variant="default"><CheckCircle className="w-4 h-4 mr-1" />Implementado</Badge>;
      case 'closed':
        return <Badge variant="destructive">Fechado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bug': return 'bg-red-100 text-red-800';
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'improvement': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Feedback dos Usuários
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchFeedbacks}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p>Carregando feedbacks...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Feedback dos Usuários ({feedbacks.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchFeedbacks}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedbacks.length === 0 ? (
          <p className="text-gray-500">Nenhum feedback encontrado.</p>
        ) : (
          feedbacks.map((feedback) => (
            <div key={feedback.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{feedback.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{feedback.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getCategoryColor(feedback.category)}>
                      {feedback.category}
                    </Badge>
                    {getStatusBadge(feedback.status)}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{new Date(feedback.created_at).toLocaleDateString('pt-BR')}</p>
                  <p className="mt-1">{feedback.user_name}</p>
                  <p>{feedback.user_email}</p>
                </div>
              </div>

              {feedback.status === 'open' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpdateStatus(feedback.id, 'in-review')}
                    variant="outline"
                    size="sm"
                    disabled={actionLoading === feedback.id}
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {actionLoading === feedback.id ? 'Atualizando...' : 'Marcar como Em Análise'}
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(feedback.id, 'implemented')}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                    disabled={actionLoading === feedback.id}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {actionLoading === feedback.id ? 'Atualizando...' : 'Marcar como Implementado'}
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
