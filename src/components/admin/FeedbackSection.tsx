
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MessageSquare, Clock, RefreshCw, Phone, Mail, User } from 'lucide-react';
import { contributionService, UserFeedback } from '@/services/contributionService';
import { useToast } from '@/hooks/use-toast';

export const FeedbackSection = () => {
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await contributionService.getAllFeedbacks();
      setFeedbacks(data);
      console.log('Feedbacks loaded:', data);
    } catch (error) {
      console.error('Erro ao buscar feedbacks:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar feedbacks dos usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    
    // Atualizar lista a cada 30 segundos
    const interval = setInterval(fetchFeedbacks, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (feedbackId: string, status: 'reviewed' | 'resolved') => {
    try {
      await contributionService.updateFeedbackStatus(feedbackId, status);
      toast({
        title: "Sucesso",
        description: `Feedback marcado como ${status === 'reviewed' ? 'revisado' : 'resolvido'}`,
      });
      fetchFeedbacks(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao atualizar status do feedback:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do feedback",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="destructive"><MessageSquare className="w-4 h-4 mr-1" />Novo</Badge>;
      case 'reviewed':
        return <Badge variant="secondary"><Clock className="w-4 h-4 mr-1" />Revisado</Badge>;
      case 'resolved':
        return <Badge variant="default"><CheckCircle className="w-4 h-4 mr-1" />Resolvido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      improvement: 'bg-blue-100 text-blue-800',
      feature: 'bg-green-100 text-green-800',
      bug: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      improvement: 'Melhoria',
      feature: 'Funcionalidade',
      bug: 'Bug',
      other: 'Outro'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[category as keyof typeof colors] || colors.other}`}>
        {labels[category as keyof typeof labels] || category}
      </span>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Feedbacks dos Usuários</CardTitle>
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
          <CardTitle>Feedbacks dos Usuários</CardTitle>
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{feedback.title}</h3>
                    {getCategoryBadge(feedback.category)}
                  </div>
                  <p className="text-sm text-gray-600">{feedback.description}</p>
                </div>
                <div className="text-right">
                  {getStatusBadge(feedback.status)}
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(feedback.created_at || feedback.createdAt || '').toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2 flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Dados do Usuário
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Nome:</strong> {feedback.user_name || feedback.userName}</p>
                  <p className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    <strong>Email:</strong> {feedback.user_email || feedback.userEmail}
                  </p>
                  {(feedback.user_phone || feedback.userPhone) && (
                    <p className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      <strong>Telefone:</strong> {feedback.user_phone || feedback.userPhone}
                    </p>
                  )}
                </div>
              </div>

              {feedback.status === 'new' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatusUpdate(feedback.id, 'reviewed')}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Marcar como Revisado
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(feedback.id, 'resolved')}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Marcar como Resolvido
                  </Button>
                </div>
              )}

              {feedback.status === 'reviewed' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatusUpdate(feedback.id, 'resolved')}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Marcar como Resolvido
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
