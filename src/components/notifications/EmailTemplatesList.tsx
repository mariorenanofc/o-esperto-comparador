import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Send, 
  Mail,
  Search,
  Loader2
} from 'lucide-react';
import { EmailTemplate, emailTemplatesService } from '@/services/emailTemplatesService';
import { EmailTemplateEditor } from './EmailTemplateEditor';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const EmailTemplatesList: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templatesData = await emailTemplatesService.getTemplates();
      setTemplates(templatesData);
    } catch (error) {
      toast.error("Erro ao carregar templates");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (template: EmailTemplate) => {
    try {
      if (template.id) {
        await emailTemplatesService.updateTemplate(template.id, template);
        toast.success("Template atualizado com sucesso");
      } else {
        await emailTemplatesService.createTemplate(template);
        toast.success("Template criado com sucesso");
      }
      
      await loadTemplates();
      setIsEditorOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      toast.error("Erro ao salvar template");
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      await emailTemplatesService.deleteTemplate(templateId);
      toast.success("Template excluído com sucesso");
      await loadTemplates();
    } catch (error) {
      toast.error("Erro ao excluir template");
    }
  };

  const handleTestTemplate = async (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsTestDialogOpen(true);
  };

  const sendTestEmail = async () => {
    if (!selectedTemplate || !testEmail) return;

    try {
      setIsTesting(true);
      
      // Use the send-email edge function directly
      const response = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmail,
          template_id: selectedTemplate.id!,
          variables: {
            user_name: 'Usuário Teste',
            app_name: 'Economia Comparada',
            date: new Date().toLocaleDateString('pt-BR'),
            action_url: window.location.origin,
            // Add any other variables from the template
            ...selectedTemplate.variables?.reduce((acc, variable) => {
              acc[variable] = `[Teste ${variable}]`;
              return acc;
            }, {} as Record<string, string>)
          }
        }
      });

      if (response.error) {
        throw response.error;
      }

      toast.success(`Email de teste enviado para ${testEmail} (simulado)`);
      
      setIsTestDialogOpen(false);
      setTestEmail('');
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error("Erro ao enviar email de teste");
    } finally {
      setIsTesting(false);
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Carregando templates...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Templates de Email</h2>
          <p className="text-muted-foreground">
            Gerencie templates reutilizáveis para notificações por email
          </p>
        </div>
        <Button onClick={() => {
          setSelectedTemplate(null);
          setIsEditorOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum template encontrado</p>
            <p className="text-muted-foreground">
              {searchQuery ? 'Tente alterar os filtros de busca' : 'Crie seu primeiro template de email'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      {template.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.subject}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {template.variables?.length || 0} variáveis
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleTestTemplate(template)}
                      title="Enviar teste"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setIsEditorOpen(true);
                      }}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTemplate(template.id!)}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {template.variables && template.variables.length > 0 && (
                <CardContent>
                  <div className="flex gap-1 flex-wrap">
                    {template.variables.map((variable) => (
                      <Badge key={variable} variant="secondary" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
          </DialogHeader>
          <EmailTemplateEditor
            template={selectedTemplate || undefined}
            onSave={handleSaveTemplate}
          />
        </DialogContent>
      </Dialog>

      {/* Test Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Testar Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-email">Email de destino</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="seu-email@exemplo.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsTestDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={sendTestEmail}
                disabled={!testEmail || isTesting}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Teste
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};