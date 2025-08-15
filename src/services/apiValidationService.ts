import { PriceContribution, DailyOffer } from '@/lib/types';

export const apiValidationService = {
  // Sanitização de strings para prevenir XSS
  sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    return input
      .trim()
      .replace(/[<>\"\'&]/g, '') // Remove caracteres perigosos
      .substring(0, 255); // Limita tamanho
  },

  // Validação de entrada para contribuições
  validateContributionInput(contribution: PriceContribution): { 
    isValid: boolean; 
    errors: string[]; 
    sanitized?: PriceContribution 
  } {
    const errors: string[] = [];
    
    // Validar estrutura básica
    if (!contribution || typeof contribution !== 'object') {
      return { isValid: false, errors: ['Dados de contribuição inválidos'] };
    }

    // Validar e sanitizar campos obrigatórios
    const sanitizedContribution: PriceContribution = {
      ...contribution,
      productName: this.sanitizeString(contribution.productName || ''),
      storeName: this.sanitizeString(contribution.storeName || ''),
      city: this.sanitizeString(contribution.city || ''),
      state: this.sanitizeString(contribution.state || ''),
      unit: this.sanitizeString(contribution.unit || 'unidade')
    };

    // Validações específicas
    if (!sanitizedContribution.productName || sanitizedContribution.productName.length < 2) {
      errors.push('Nome do produto deve ter pelo menos 2 caracteres');
    }

    if (!sanitizedContribution.storeName || sanitizedContribution.storeName.length < 2) {
      errors.push('Nome da loja deve ter pelo menos 2 caracteres');
    }

    if (!sanitizedContribution.city || sanitizedContribution.city.length < 2) {
      errors.push('Nome da cidade deve ter pelo menos 2 caracteres');
    }

    if (!sanitizedContribution.state || sanitizedContribution.state.length < 2) {
      errors.push('Nome do estado deve ter pelo menos 2 caracteres');
    }

    // Validar preço
    if (typeof sanitizedContribution.price !== 'number' || 
        isNaN(sanitizedContribution.price) || 
        sanitizedContribution.price <= 0) {
      errors.push('Preço deve ser um número válido maior que zero');
    }

    if (sanitizedContribution.price > 999999) {
      errors.push('Preço não pode ser maior que R$ 999.999,00');
    }

    // Validar quantidade
    if (sanitizedContribution.quantity && 
        (typeof sanitizedContribution.quantity !== 'number' || 
         sanitizedContribution.quantity < 1 || 
         sanitizedContribution.quantity > 1000)) {
      errors.push('Quantidade deve ser um número entre 1 e 1000');
    }

    // Validar userId
    if (!sanitizedContribution.userId || typeof sanitizedContribution.userId !== 'string') {
      errors.push('ID do usuário é obrigatório');
    }

    const isValid = errors.length === 0;
    
    return {
      isValid,
      errors,
      sanitized: isValid ? sanitizedContribution : undefined
    };
  },

  // Validação de parâmetros de busca
  validateSearchParams(params: {
    city?: string;
    state?: string;
    limit?: number;
    offset?: number;
  }): { isValid: boolean; errors: string[]; sanitized?: any } {
    const errors: string[] = [];
    
    const sanitized = {
      city: params.city ? this.sanitizeString(params.city) : undefined,
      state: params.state ? this.sanitizeString(params.state) : undefined,
      limit: params.limit || 50,
      offset: params.offset || 0
    };

    // Validar limites
    if (sanitized.limit < 1 || sanitized.limit > 100) {
      errors.push('Limite deve estar entre 1 e 100');
    }

    if (sanitized.offset < 0) {
      errors.push('Offset deve ser maior ou igual a 0');
    }

    // Validar localização se fornecida
    if (sanitized.city && sanitized.city.length < 2) {
      errors.push('Nome da cidade deve ter pelo menos 2 caracteres');
    }

    if (sanitized.state && sanitized.state.length < 2) {
      errors.push('Nome do estado deve ter pelo menos 2 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? sanitized : undefined
    };
  },

  // Validação de entrada para IDs
  validateUuid(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof id === 'string' && uuidRegex.test(id);
  },

  // Validação de rate limiting (básico)
  validateRateLimit(userActions: { timestamp: Date; action: string }[]): {
    allowed: boolean;
    message?: string;
  } {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Contar ações na última hora
    const actionsLastHour = userActions.filter(action => action.timestamp > oneHourAgo);
    const actionsLastMinute = userActions.filter(action => action.timestamp > oneMinuteAgo);

    // Limites básicos
    if (actionsLastMinute.length > 5) {
      return {
        allowed: false,
        message: 'Muitas ações na última minuto. Aguarde um pouco.'
      };
    }

    if (actionsLastHour.length > 50) {
      return {
        allowed: false,
        message: 'Limite de ações por hora excedido. Tente novamente mais tarde.'
      };
    }

    return { allowed: true };
  },

  // Validação de conteúdo para detecção de spam
  validateContentForSpam(content: string): {
    isSpam: boolean;
    confidence: number;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let spamScore = 0;

    // Verificar repetição excessiva de caracteres
    if (/(.)\1{4,}/.test(content)) {
      reasons.push('Repetição excessiva de caracteres');
      spamScore += 30;
    }

    // Verificar CAPS LOCK excessivo
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.7 && content.length > 10) {
      reasons.push('Uso excessivo de maiúsculas');
      spamScore += 25;
    }

    // Verificar URLs ou padrões suspeitos
    if (/https?:\/\/|www\./gi.test(content)) {
      reasons.push('Contém URLs');
      spamScore += 40;
    }

    // Verificar números de telefone ou emails
    if (/\b\d{4,}\b/.test(content) || /@/.test(content)) {
      reasons.push('Contém informações de contato');
      spamScore += 35;
    }

    // Verificar palavras comuns de spam
    const spamWords = ['gratis', 'ganhe', 'dinheiro', 'promocao', 'oferta', 'desconto'];
    const spamWordCount = spamWords.filter(word => 
      content.toLowerCase().includes(word)
    ).length;
    
    if (spamWordCount > 2) {
      reasons.push('Contém muitas palavras promocionais');
      spamScore += 20;
    }

    return {
      isSpam: spamScore > 60,
      confidence: Math.min(spamScore, 100),
      reasons
    };
  }
};