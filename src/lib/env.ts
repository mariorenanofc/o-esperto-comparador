
// Configurações de ambiente para o projeto Lovable
// No ambiente de produção, estas seriam variáveis de ambiente reais

export const env = {
  // Clerk
  CLERK_PUBLISHABLE_KEY: "pk_test_Y2xlay1kZWxpY2lvdXMtZ29hdC00Ny5jbGVyay5hY2NvdW50cy5kZXYk",
  
  // Database (para uso futuro com Prisma/Neon)
  DATABASE_URL: import.meta.env.VITE_DATABASE_URL || "",
  
  // URLs de redirecionamento
  AFTER_SIGN_IN_URL: "/",
  AFTER_SIGN_UP_URL: "/",
  
  // Modo de desenvolvimento
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
};
