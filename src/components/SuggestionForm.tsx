
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { contributionService, SuggestionData } from "@/services/contributionService";

interface SuggestionFormProps {
  onClose: () => void;
}

const SuggestionForm: React.FC<SuggestionFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SuggestionData>({
    title: "",
    description: "",
    category: "improvement",
    userName: "",
    userEmail: "",
    userPhone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== SUGGESTION FORM SUBMISSION ===');
    console.log('Form data:', formData);
    console.log('User:', user?.id);
    
    if (!user) {
      console.error('No user found');
      toast.error("Você precisa estar logado para enviar sugestões.");
      return;
    }

    // Validações
    if (!formData.title.trim()) {
      toast.error("Título é obrigatório.");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Descrição é obrigatória.");
      return;
    }

    if (!formData.userName.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }

    if (!formData.userEmail.trim()) {
      toast.error("Email é obrigatório.");
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.userEmail)) {
      toast.error("Email inválido.");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting suggestion...');
      
      await contributionService.submitSuggestion(user.id, formData);
      
      console.log('Suggestion submitted successfully!');
      toast.success("Sugestão enviada com sucesso! Obrigado pelo seu feedback! 🚀");
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "improvement",
        userName: "",
        userEmail: "",
        userPhone: "",
      });
      
      onClose();
    } catch (error) {
      console.error("=== ERROR SUBMITTING SUGGESTION ===");
      console.error("Error:", error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao enviar sugestão: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Enviar Sugestão</CardTitle>
        <CardDescription>
          Compartilhe suas ideias para melhorarmos a plataforma
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="userName">Nome Completo *</Label>
            <Input
              id="userName"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div>
            <Label htmlFor="userEmail">Email *</Label>
            <Input
              id="userEmail"
              type="email"
              value={formData.userEmail}
              onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="userPhone">Telefone</Label>
            <Input
              id="userPhone"
              type="tel"
              value={formData.userPhone}
              onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="improvement">Melhoria</SelectItem>
                <SelectItem value="feature">Nova Funcionalidade</SelectItem>
                <SelectItem value="bug">Reportar Bug</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Título da Sugestão *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Resumo da sua sugestão"
              required
            />
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
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-app-blue hover:bg-blue-700"
            >
              {isSubmitting ? "Enviando..." : "Enviar Sugestão"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SuggestionForm;
