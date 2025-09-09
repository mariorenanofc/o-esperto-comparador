import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Mail, Eye, Save, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

interface EmailTemplateEditorProps {
  template?: EmailTemplate;
  onSave: (template: Omit<EmailTemplate, 'id'>) => void;
  onTest?: (template: EmailTemplate) => void;
}

export const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  template,
  onSave,
  onTest
}) => {
  const { toast } = useToast();
  const [name, setName] = useState(template?.name || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [htmlContent, setHtmlContent] = useState(template?.htmlContent || '');
  const [textContent, setTextContent] = useState(template?.textContent || '');

  const defaultVariables = ['{{user_name}}', '{{app_name}}', '{{date}}', '{{action_url}}'];

  const handleSave = () => {
    if (!name || !subject || (!htmlContent && !textContent)) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    onSave({
      name,
      subject,
      htmlContent,
      textContent,
      variables: defaultVariables
    });

    toast({
      title: "Template salvo",
      description: "Template de email foi salvo com sucesso"
    });
  };

  const handleTest = () => {
    if (onTest && template) {
      onTest({
        ...template,
        name,
        subject,
        htmlContent,
        textContent,
        variables: defaultVariables
      });
    }
  };

  const insertVariable = (variable: string, isHtml: boolean = true) => {
    if (isHtml) {
      setHtmlContent(prev => prev + variable);
    } else {
      setTextContent(prev => prev + variable);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Editor de Template de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template-name">Nome do Template</Label>
              <Input
                id="template-name"
                placeholder="Ex: Notificação de Oferta"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="template-subject">Assunto do Email</Label>
              <Input
                id="template-subject"
                placeholder="Ex: Nova oferta disponível!"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Variáveis Disponíveis</Label>
            <div className="flex flex-wrap gap-2">
              {defaultVariables.map((variable) => (
                <Badge
                  key={variable}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => insertVariable(variable)}
                >
                  {variable}
                </Badge>
              ))}
            </div>
          </div>

          <Tabs defaultValue="html" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="text">Texto</TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="space-y-2">
              <Label htmlFor="html-content">Conteúdo HTML</Label>
              <Textarea
                id="html-content"
                placeholder="Digite o conteúdo HTML do email..."
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </TabsContent>

            <TabsContent value="text" className="space-y-2">
              <Label htmlFor="text-content">Conteúdo de Texto</Label>
              <Textarea
                id="text-content"
                placeholder="Digite o conteúdo de texto do email..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={12}
              />
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Salvar Template
            </Button>
            
            {onTest && (
              <Button
                variant="outline"
                onClick={handleTest}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Testar Envio
              </Button>
            )}
            
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                // Preview functionality could be implemented here
                toast({
                  title: "Preview",
                  description: "Funcionalidade de preview será implementada"
                });
              }}
            >
              <Eye className="h-4 w-4" />
              Visualizar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};