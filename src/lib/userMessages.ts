/**
 * User-friendly error messages system
 * Maps error codes and types to helpful, actionable messages in Portuguese
 */

interface UserMessage {
  title: string;
  description: string;
  action?: string;
  actionLabel?: string;
}

// Common error code mappings
const ERROR_CODES: Record<string, UserMessage> = {
  // Authentication errors
  'auth/invalid-email': {
    title: 'Email inválido',
    description: 'Por favor, verifique se o email está correto.',
    actionLabel: 'Tentar novamente'
  },
  'auth/user-not-found': {
    title: 'Usuário não encontrado',
    description: 'Não encontramos uma conta com esse email.',
    action: '/signup',
    actionLabel: 'Criar conta'
  },
  'auth/wrong-password': {
    title: 'Senha incorreta',
    description: 'A senha informada não está correta.',
    actionLabel: 'Esqueci minha senha'
  },
  'auth/email-already-in-use': {
    title: 'Email já cadastrado',
    description: 'Esse email já está sendo usado por outra conta.',
    action: '/login',
    actionLabel: 'Fazer login'
  },
  'auth/weak-password': {
    title: 'Senha fraca',
    description: 'Use uma senha com pelo menos 6 caracteres.',
    actionLabel: 'Tentar novamente'
  },
  'auth/too-many-requests': {
    title: 'Muitas tentativas',
    description: 'Aguarde alguns minutos antes de tentar novamente.',
  },
  
  // Supabase specific
  'PGRST116': {
    title: 'Dados não encontrados',
    description: 'Não encontramos o que você estava procurando.',
    actionLabel: 'Voltar'
  },
  'PGRST301': {
    title: 'Erro de autenticação',
    description: 'Sua sessão expirou. Por favor, faça login novamente.',
    action: '/login',
    actionLabel: 'Fazer login'
  },
  '42501': {
    title: 'Acesso negado',
    description: 'Você não tem permissão para realizar esta ação.',
  },
  '23505': {
    title: 'Registro duplicado',
    description: 'Este item já existe no sistema.',
  },
  '23503': {
    title: 'Registro relacionado',
    description: 'Este item está vinculado a outros registros.',
  },
  
  // Network errors
  'NetworkError': {
    title: 'Sem conexão',
    description: 'Verifique sua conexão com a internet.',
    actionLabel: 'Tentar novamente'
  },
  'TimeoutError': {
    title: 'Tempo esgotado',
    description: 'A requisição demorou demais. Tente novamente.',
    actionLabel: 'Tentar novamente'
  },
  'AbortError': {
    title: 'Requisição cancelada',
    description: 'A operação foi interrompida.',
  },
  
  // HTTP status codes
  '400': {
    title: 'Requisição inválida',
    description: 'Verifique os dados informados e tente novamente.',
  },
  '401': {
    title: 'Não autorizado',
    description: 'Faça login para continuar.',
    action: '/login',
    actionLabel: 'Fazer login'
  },
  '403': {
    title: 'Acesso negado',
    description: 'Você não tem permissão para acessar este recurso.',
  },
  '404': {
    title: 'Não encontrado',
    description: 'O recurso solicitado não foi encontrado.',
    action: '/',
    actionLabel: 'Ir para início'
  },
  '429': {
    title: 'Muitas requisições',
    description: 'Você excedeu o limite. Aguarde um momento.',
  },
  '500': {
    title: 'Erro interno',
    description: 'Algo deu errado. Nossa equipe foi notificada.',
    actionLabel: 'Tentar novamente'
  },
  '502': {
    title: 'Servidor indisponível',
    description: 'O servidor está temporariamente fora do ar.',
    actionLabel: 'Tentar novamente'
  },
  '503': {
    title: 'Serviço indisponível',
    description: 'O sistema está em manutenção. Tente em alguns minutos.',
  },
};

// Default messages by error type
const DEFAULT_MESSAGES: Record<string, UserMessage> = {
  auth: {
    title: 'Erro de autenticação',
    description: 'Ocorreu um problema com o login. Tente novamente.',
    action: '/login',
    actionLabel: 'Fazer login'
  },
  network: {
    title: 'Erro de conexão',
    description: 'Não foi possível conectar ao servidor.',
    actionLabel: 'Tentar novamente'
  },
  validation: {
    title: 'Dados inválidos',
    description: 'Verifique as informações e tente novamente.',
  },
  permission: {
    title: 'Acesso negado',
    description: 'Você não tem permissão para esta ação.',
  },
  notFound: {
    title: 'Não encontrado',
    description: 'O recurso solicitado não existe.',
  },
  server: {
    title: 'Erro no servidor',
    description: 'Ocorreu um erro inesperado. Tente novamente.',
    actionLabel: 'Tentar novamente'
  },
  unknown: {
    title: 'Algo deu errado',
    description: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
    actionLabel: 'Tentar novamente'
  },
};

/**
 * Get a user-friendly message from an error
 */
export function getUserMessage(error: unknown): UserMessage {
  if (!error) {
    return DEFAULT_MESSAGES.unknown;
  }

  // Handle string errors
  if (typeof error === 'string') {
    const mapped = ERROR_CODES[error];
    if (mapped) return mapped;
    
    // Check if it's a status code
    if (/^\d{3}$/.test(error)) {
      return ERROR_CODES[error] || DEFAULT_MESSAGES.server;
    }
    
    return {
      ...DEFAULT_MESSAGES.unknown,
      description: error
    };
  }

  // Handle Error objects
  if (error instanceof Error) {
    const errorName = error.name;
    const errorMessage = error.message;
    
    // Check error name
    if (ERROR_CODES[errorName]) {
      return ERROR_CODES[errorName];
    }
    
    // Check for specific error patterns
    if (errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
      return ERROR_CODES.NetworkError;
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      return ERROR_CODES.TimeoutError;
    }
    
    if (errorMessage.includes('abort') || errorMessage.includes('Abort')) {
      return ERROR_CODES.AbortError;
    }
    
    // Check for Supabase error codes in message
    for (const code of Object.keys(ERROR_CODES)) {
      if (errorMessage.includes(code)) {
        return ERROR_CODES[code];
      }
    }
  }

  // Handle objects with code/status properties
  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, unknown>;
    
    // Check for error code
    if (errObj.code && typeof errObj.code === 'string') {
      const mapped = ERROR_CODES[errObj.code];
      if (mapped) return mapped;
    }
    
    // Check for status code
    if (errObj.status && typeof errObj.status === 'number') {
      const mapped = ERROR_CODES[errObj.status.toString()];
      if (mapped) return mapped;
    }
    
    // Check for message
    if (errObj.message && typeof errObj.message === 'string') {
      return getUserMessage(errObj.message);
    }
  }

  return DEFAULT_MESSAGES.unknown;
}

/**
 * Get the error type category
 */
export function getErrorType(error: unknown): keyof typeof DEFAULT_MESSAGES {
  if (!error) return 'unknown';

  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, unknown>;
    
    // Auth errors
    if (errObj.code && typeof errObj.code === 'string' && errObj.code.startsWith('auth/')) {
      return 'auth';
    }
    
    // Permission errors
    if (errObj.code === '42501' || errObj.status === 403) {
      return 'permission';
    }
    
    // Not found errors
    if (errObj.code === 'PGRST116' || errObj.status === 404) {
      return 'notFound';
    }
    
    // Server errors
    if (errObj.status && typeof errObj.status === 'number' && errObj.status >= 500) {
      return 'server';
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'network';
    }
  }

  return 'unknown';
}

/**
 * Format error for display in toast notifications
 */
export function formatErrorForToast(error: unknown): { title: string; description: string } {
  const message = getUserMessage(error);
  return {
    title: message.title,
    description: message.description
  };
}

export { ERROR_CODES, DEFAULT_MESSAGES };
export type { UserMessage };
