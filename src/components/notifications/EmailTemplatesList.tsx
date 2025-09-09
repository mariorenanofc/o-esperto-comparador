import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Send, 
  Mail,
  Search,
  Loader2,
  Download
} from 'lucide-react';
import { EmailTemplate, emailTemplatesService } from '@/services/emailTemplatesService';
import { EmailTemplateEditor } from './EmailTemplateEditor';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const EmailTemplatesList: React.FC = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImporting, setIsImporting] = useState(false);

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
    setTestEmail(user?.email || '');
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

  const exampleTemplates = [
    {
      name: "Boas-vindas",
      subject: "Bem-vindo ao {{app_name}}!",
      html_content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">Bem-vindo, {{user_name}}!</h1>
          <p>Obrigado por se juntar ao <strong>{{app_name}}</strong>.</p>
          <p>Agora você pode:</p>
          <ul>
            <li>Comparar preços de produtos</li>
            <li>Contribuir com ofertas diárias</li>
            <li>Receber alertas de preços</li>
            <li>Gerar relatórios mensais</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{action_url}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Começar agora</a>
          </div>
          <p style="color: #666; font-size: 14px;">Atenciosamente,<br>Equipe {{app_name}}</p>
        </div>
      `,
      text_content: "Bem-vindo, {{user_name}}!\n\nObrigado por se juntar ao {{app_name}}.\n\nAgora você pode comparar preços, contribuir com ofertas e muito mais.\n\nAcesse: {{action_url}}\n\nAtenciosamente,\nEquipe {{app_name}}",
      variables: ["user_name", "app_name", "action_url"]
    },
    {
      name: "Alerta de Preço",
      subject: "🔔 Alerta: {{product_name}} com preço baixo!",
      html_content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #dc2626;">🔔 Alerta de Preço!</h1>
          <p>Olá {{user_name}},</p>
          <p>O produto <strong>{{product_name}}</strong> está com um preço especial:</p>
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #dc2626; margin: 0;">{{product_name}}</h2>
            <p style="font-size: 24px; font-weight: bold; color: #dc2626; margin: 10px 0;">R$ {{new_price}}</p>
            <p style="color: #666;">De: <span style="text-decoration: line-through;">R$ {{old_price}}</span></p>
            <p style="color: #666;">Loja: {{store_name}}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{action_url}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ver Oferta</a>
          </div>
          <p style="color: #666; font-size: 12px;">Você está recebendo este alerta porque configurou notificações para este produto.</p>
        </div>
      `,
      text_content: "🔔 Alerta de Preço!\n\nOlá {{user_name}},\n\nO produto {{product_name}} está com preço especial:\n\nPreço: R$ {{new_price}} (era R$ {{old_price}})\nLoja: {{store_name}}\n\nVer oferta: {{action_url}}\n\nVocê está recebendo este alerta porque configurou notificações.",
      variables: ["user_name", "product_name", "new_price", "old_price", "store_name", "action_url"]
    },
    {
      name: "Relatório Mensal",
      subject: "📊 Seu relatório mensal de {{month}} está pronto",
      html_content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #059669;">📊 Relatório de {{month}}</h1>
          <p>Olá {{user_name}},</p>
          <p>Aqui está o resumo das suas atividades em {{month}}:</p>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">Estatísticas do Mês</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>{{comparisons_count}}</strong> comparações realizadas</li>
              <li><strong>{{contributions_count}}</strong> contribuições de preços</li>
              <li><strong>R$ {{total_savings}}</strong> em economia identificada</li>
              <li><strong>{{visited_stores}}</strong> lojas visitadas</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{report_url}}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ver Relatório Completo</a>
          </div>
          <p style="color: #666; font-size: 14px;">Continue economizando com {{app_name}}!</p>
        </div>
      `,
      text_content: "📊 Relatório de {{month}}\n\nOlá {{user_name}},\n\nResumo do mês:\n- {{comparisons_count}} comparações\n- {{contributions_count}} contribuições\n- R$ {{total_savings}} economia identificada\n- {{visited_stores}} lojas visitadas\n\nVer relatório: {{report_url}}\n\nContinue economizando!",
      variables: ["user_name", "month", "comparisons_count", "contributions_count", "total_savings", "visited_stores", "report_url", "app_name"]
    },
    {
      name: "Confirmação de Contribuição",
      subject: "✅ Obrigado pela contribuição de preço!",
      html_content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7c3aed;">✅ Contribuição Recebida!</h1>
          <p>Olá {{contributor_name}},</p>
          <p>Obrigado por contribuir com informações de preço para nossa comunidade!</p>
          <div style="background-color: #faf5ff; border: 1px solid #d8b4fe; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #7c3aed; margin-top: 0;">Detalhes da Contribuição</h3>
            <p><strong>Produto:</strong> {{product_name}}</p>
            <p><strong>Preço:</strong> R$ {{price}}</p>
            <p><strong>Loja:</strong> {{store_name}}</p>
            <p><strong>Local:</strong> {{city}}, {{state}}</p>
            <p><strong>Data:</strong> {{date}}</p>
          </div>
          <p>Sua contribuição será verificada por nossa equipe e ficará disponível para outros usuários em breve.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{action_url}}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ver Minhas Contribuições</a>
          </div>
          <p style="color: #666; font-size: 14px;">Obrigado por tornar o {{app_name}} melhor para todos!</p>
        </div>
      `,
      text_content: "✅ Contribuição Recebida!\n\nOlá {{contributor_name}},\n\nObrigado por contribuir!\n\nDetalhes:\n- Produto: {{product_name}}\n- Preço: R$ {{price}}\n- Loja: {{store_name}}\n- Local: {{city}}, {{state}}\n- Data: {{date}}\n\nVer contribuições: {{action_url}}\n\nObrigado!",
      variables: ["contributor_name", "product_name", "price", "store_name", "city", "state", "date", "action_url", "app_name"]
    },
    {
      name: "Lembrete de Renovação",
      subject: "🔔 Seu plano {{plan_name}} expira em {{days_remaining}} dias",
      html_content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ea580c;">🔔 Lembrete de Renovação</h1>
          <p>Olá {{user_name}},</p>
          <p>Seu plano <strong>{{plan_name}}</strong> expira em <strong>{{days_remaining}} dias</strong>.</p>
          <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #ea580c; margin-top: 0;">Detalhes da Assinatura</h3>
            <p><strong>Plano:</strong> {{plan_name}}</p>
            <p><strong>Expira em:</strong> {{expiry_date}}</p>
            <p><strong>Valor:</strong> R$ {{plan_price}}/mês</p>
          </div>
          <p>Renove agora para continuar aproveitando todos os benefícios:</p>
          <ul>
            <li>Comparações ilimitadas</li>
            <li>Alertas de preços personalizados</li>
            <li>Relatórios detalhados</li>
            <li>Suporte prioritário</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{renewal_url}}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Renovar Agora</a>
          </div>
          <p style="color: #666; font-size: 14px;">Precisa de ajuda? Entre em contato conosco.</p>
        </div>
      `,
      text_content: "🔔 Lembrete de Renovação\n\nOlá {{user_name}},\n\nSeu plano {{plan_name}} expira em {{days_remaining}} dias.\n\nDetalhes:\n- Plano: {{plan_name}}\n- Expira: {{expiry_date}}\n- Valor: R$ {{plan_price}}/mês\n\nRenovar: {{renewal_url}}\n\nPrecisa de ajuda? Entre em contato.",
      variables: ["user_name", "plan_name", "days_remaining", "expiry_date", "plan_price", "renewal_url"]
    }
  ];

  const importExampleTemplates = async () => {
    try {
      setIsImporting(true);
      
      // Check which templates already exist
      const existingTemplates = templates.map(t => t.name);
      const templatesToImport = exampleTemplates.filter(
        template => !existingTemplates.includes(template.name)
      );

      if (templatesToImport.length === 0) {
        toast.info("Todos os templates de exemplo já existem");
        return;
      }

      // Import each template
      for (const template of templatesToImport) {
        await emailTemplatesService.createTemplate(template);
      }

      toast.success(`${templatesToImport.length} templates importados com sucesso`);
      await loadTemplates();
    } catch (error) {
      toast.error("Erro ao importar templates");
    } finally {
      setIsImporting(false);
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={importExampleTemplates}
            disabled={isImporting}
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Importar Exemplos
          </Button>
          <Button onClick={() => {
            setSelectedTemplate(null);
            setIsEditorOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </div>
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
            <DialogDescription>
              Envie um email de teste usando este template para verificar como ficará formatado.
            </DialogDescription>
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