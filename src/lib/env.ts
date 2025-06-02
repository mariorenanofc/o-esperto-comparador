
// Validação de variáveis de ambiente para produção
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
  CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET!,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Validar variáveis obrigatórias
if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

if (!env.CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY is required');
}

if (!env.CLERK_WEBHOOK_SECRET && env.NODE_ENV === 'production') {
  console.warn('CLERK_WEBHOOK_SECRET is recommended for production');
}
