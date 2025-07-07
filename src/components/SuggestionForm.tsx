
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { contributionService } from "@/services/contributionService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const SuggestionForm: React.FC = () => {
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    userName: profile?.name || '',
    userEmail: profile?.email || '',
    userPhone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para enviar sugestões');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    toast.loading('Enviando sugestão...', { id: 'suggestion-submit' });

    try {
      console.log('Enviando sugestão:', formData);
      
      await contributionService.submitSuggestion(user.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category as 'improvement' | 'feature' | 'bug' | 'other',
        userName: formData.userName || profile?.name || 'Usuário',
        userEmail: formData.userEmail || profile?.email || '',
        userPhone: formData.userPhone
      });

      toast.success('🎉 Sugestão enviada com sucesso! Obrigado pelo seu feedback!', { 
        id: 'suggestion-submit',
        duration: 5000 
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        userName: profile?.name || '',
        userEmail: profile?.email || '',
        userPhone: ''
      });

    } catch (error) {
      console.error('Erro ao enviar sugestão:', error);
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
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Faça Login</CardTitle>
          <CardDescription>
            Você precisa estar logado para enviar sugestões
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Enviar Sugestão</CardTitle>
        <CardDescription>
          Ajude-nos a melhorar a plataforma com suas ideias e feedback
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Sugestão *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Melhorar sistema de busca"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="improvement">Melhoria</SelectItem>
                <SelectItem value="feature">Nova Funcionalidade</SelectItem>
                <SelectItem value="bug">Correção de Bug</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Descrição Detalhada *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva sua sugestão em detalhes..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="userName">Seu Nome</Label>
              <Input
                id="userName"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <Label htmlFor="userPhone">Telefone (Opcional)</Label>
              <Input
                id="userPhone"
                value={formData.userPhone}
                onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-app-blue hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando Sugestão...
              </>
            ) : (
              "Enviar Sugestão"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SuggestionForm;
