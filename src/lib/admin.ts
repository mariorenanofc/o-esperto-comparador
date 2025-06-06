
// Lista de User IDs que são administradores - substitua pelos IDs reais dos usuários
const ADMIN_USER_IDS = [
  'f47ac10b-58cc-4372-a567-0e02b2c3d479', // Substitua pelo ID real do primeiro administrador
  '6ba7b810-9dad-11d1-80b4-00c04fd430c8'  // Substitua pelo ID real do segundo administrador
];

export const isAdmin = (userId: string): boolean => {
  return ADMIN_USER_IDS.includes(userId);
};

export const requireAdmin = (userId: string | null): boolean => {
  if (!userId) return false;
  return isAdmin(userId);
};
