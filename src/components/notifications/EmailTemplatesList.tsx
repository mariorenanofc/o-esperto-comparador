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
  Loader2,
  Eye
} from 'lucide-react';
import { EmailTemplate, emailTemplatesService } from '@/services/emailTemplatesService';
import { emailService } from '@/services/emailService';
import { EmailTemplateEditor } from './EmailTemplateEditor';
import { useToast } from '@/hooks/use-toast';

export const EmailTemplatesList: React.FC = () => {
  const { toast } = useToast();
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
      toast({
        title: "Erro",
        description: "Erro ao carregar templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (template: EmailTemplate) => {
    try {
      if (template.id) {
        await emailTemplatesService.updateTemplate(template.id, template);
        toast({
          title: "Template atualizado",
          description: "Template foi atualizado com sucesso"
        });
      } else {
        await emailTemplatesService.createTemplate(template);
        toast({
          title: "Template criado",
          description: "Template foi criado com sucesso"
        });
      }
      
      await loadTemplates();
      setIsEditorOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar template",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      await emailTemplatesService.deleteTemplate(templateId);
      toast({
        title: "Template excluído",
        description: "Template foi excluído com sucesso"
      });
      await loadTemplates();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir template",
        variant: "destructive"
      });
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
      await emailService.sendEmail({
        to: testEmail,
        template_id: selectedTemplate.id!,
        variables: {
          user_name: 'Usuário Teste',
          app_name: 'Economia Comparada',
          date: new Date().toLocaleDateString('pt-BR'),
          action_url: window.location.origin
        }
      });

      toast({
        title: "Teste enviado",
        description: `Email de teste enviado para ${testEmail}`
      });
      
      setIsTestDialogOpen(false);
      setTestEmail('');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar email de teste",
        variant: "destructive"
      });
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