import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { secureLog } from '@/lib/security';

interface EmailTest {
  id: string;
  timestamp: Date;
  to: string;
  template: string;
  status: 'sending' | 'success' | 'error';
  error?: string;
}

const EMAIL_TEMPLATES = [
  { id: 'welcome', name: 'Boas-vindas', description: 'Email de boas-vindas para novos usuários' },
  { id: 'notification', name: 'Notificação', description: 'Notificação geral do sistema' },
  { id: 'offer_alert', name: 'Alerta de Oferta', description: 'Notificação de nova oferta' },
  { id: 'test', name: 'Teste', description: 'Email de teste simples' },
];

export const EmailTestPanel = () => {
  const [testEmail, setTestEmail] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [tests, setTests] = useState<EmailTest[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  const sendTestEmail = async () => {
    if (!testEmail || !selectedTemplate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o email e selecione um template",
        variant: "destructive"
      });
      return;
    }

    const testId = Date.now().toString();
    const newTest: EmailTest = {
      id: testId,
      timestamp: new Date(),
      to: testEmail,
      template: selectedTemplate,
      status: 'sending'
    };

    setTests(prev => [newTest, ...prev.slice(0, 9)]); // Manter só os 10 mais recentes
    setLoading(true);

    try {
      const emailData = {
        to: testEmail,
        template: selectedTemplate,
        subject: customSubject || `Teste - ${EMAIL_TEMPLATES.find(t => t.id === selectedTemplate)?.name}`,
        message: customMessage || 'Este é um email de teste do sistema.',
        variables: {
          test_mode: true,
          timestamp: new Date().toISOString(),
          template_name: selectedTemplate
        }
      };

      const { error } = await supabase.functions.invoke('send-email', {
        body: emailData
      });

      if (error) {
        throw error;
      }

      // Atualizar status para sucesso
      setTests(prev => prev.map(test => 
        test.id === testId 
          ? { ...test, status: 'success' as const }
          : test
      ));

      toast({
        title: "✅ Email enviado!",
        description: `Email de teste enviado para ${testEmail}`,
      });

      secureLog('📧 Test email sent successfully', { 
        to: testEmail, 
        template: selectedTemplate 
      });

    } catch (error: any) {
      // Atualizar status para erro
      setTests(prev => prev.map(test => 
        test.id === testId 
          ? { ...test, status: 'error' as const, error: error.message }
          : test
      ));

      toast({
        title: "❌ Erro ao enviar",
        description: error.message || "Erro desconhecido ao enviar email",
        variant: "destructive"
      });

      console.error('Error sending test email:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: EmailTest['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: EmailTest['status']) => {
    switch (status) {
      case 'sending':
        return <Badge variant="outline">Enviando...</Badge>;
      case 'success':
        return <Badge variant="default">Enviado</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Teste de Email
        </CardTitle>
        <CardDescription>
          Teste o sistema de envio de emails do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário de Teste */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="test-email">Email de Destino</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="seu@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="template">Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-muted-foreground">{template.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subject">Assunto (Opcional)</Label>
            <Input
              id="subject"
              placeholder="Assunto personalizado"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">Mensagem Personalizada (Opcional)</Label>
            <Textarea
              id="message"
              placeholder="Conteúdo personalizado para o teste..."
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            />
          </div>

          <Button 
            onClick={sendTestEmail} 
            disabled={loading || !testEmail || !selectedTemplate}
            className="w-full"
          >
            <Send className={`h-4 w-4 mr-2 ${loading ? 'animate-pulse' : ''}`} />
            {loading ? 'Enviando...' : 'Enviar Teste'}
          </Button>
        </div>

        {/* Histórico de Testes */}
        {tests.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">📋 Histórico de Testes</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {tests.map((test) => (
                <div key={test.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="text-sm font-medium">{test.to}</div>
                      <div className="text-xs text-muted-foreground">
                        {EMAIL_TEMPLATES.find(t => t.id === test.template)?.name} • {' '}
                        {test.timestamp.toLocaleTimeString('pt-BR')}
                      </div>
                      {test.error && (
                        <div className="text-xs text-red-600 mt-1">{test.error}</div>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações Importantes */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">ℹ️ Informações</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded text-blue-800 dark:text-blue-300">
              📧 <strong>Domínio de Envio:</strong> Emails são enviados de <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">onboarding@resend.dev</code> até que um domínio personalizado seja verificado no Resend.
            </div>
            <div className="p-3 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded text-amber-800 dark:text-amber-300">
              ⏱️ <strong>Tempo de Entrega:</strong> Emails podem demorar alguns segundos para chegar. Verifique a pasta de spam.
            </div>
            <div className="p-3 bg-green-50/50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded text-green-800 dark:text-green-300">
              ✅ <strong>Modo Teste:</strong> Todos os emails enviados daqui são marcados como teste e incluem dados de debug.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};