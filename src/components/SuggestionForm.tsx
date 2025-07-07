
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { contributionService } from "@/services/contributionService";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SuggestionFormProps {
  onClose?: () => void;
}

const SuggestionForm: React.FC<SuggestionFormProps> = ({ onClose }) => {
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'improvement' as 'improvement' | 'feature' | 'bug' | 'other',
    userName: profile?.name || '',
    userEmail: profile?.email || '',
    userPhone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== INICIANDO SUBMISSÃO DA SUGESTÃO ===');
    console.log('Form data:', formData);
    console.log('User:', user?.id);
    
    if (!user) {
      toast.error('Você precisa estar logado para enviar sugestões');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    setIsSubmitting(true);
    toast.loading('Enviando sugestão...', { id: 'suggestion-submit' });

    try {
      await contributionService.submitSuggestion(user.id, formData);
      
      console.log('Sugestão enviada com sucesso!');
      toast.success('🎉 Sugestão enviada com sucesso! Obrigado pelo seu feedback!', { 
        id: 'suggestion-submit',
        duration: 5000
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'improvement',
        userName: profile?.name || '',
        userEmail: profile?.email || '',
        userPhone: ''
      });
      
      // Fechar modal após sucesso
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 1000);

    } catch (error) {
      console.error('=== ERRO AO ENVIAR SUGESTÃO ===');
      console.error('Detalhes do erro:', error);
      
      toast.error('❌ Erro ao enviar sugestão. Tente novamente.', { 
        id: 'suggestion-submit',
        duration: 5000 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Login Necessário</CardTitle>
          <CardDescription>
            Você precisa estar logado para enviar sugestões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onClose} variant="outline" className="w-full">
            Fechar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Enviar Sugestão</CardTitle>
        <CardDescription>
          Compartilhe suas ideias para melhorar nossa plataforma
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Melhorar filtros de pesquisa"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value as any })}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="improvement">Melhoria</SelectItem>
                <SelectItem value="feature">Nova Funcionalidade</SelectItem>
                <SelectItem value="bug">Problema/Bug</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva sua sugestão detalhadamente..."
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="userName">Seu Nome</Label>
            <Input
              id="userName"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              placeholder="Como podemos te chamar?"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Sugestão"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SuggestionForm;
