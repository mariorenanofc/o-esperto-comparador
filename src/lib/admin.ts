
// Lista de User IDs que são administradores
// IMPORTANTE: Substitua 'SEU_USER_ID_AQUI' pelo seu User ID real do Clerk
const ADMIN_USER_IDS = [
  'SEU_USER_ID_AQUI' // Substitua pelo seu User ID do Clerk
];

export const isAdmin = (userId: string): boolean => {
  return ADMIN_USER_IDS.includes(userId);
};

export const requireAdmin = (userId: string | null): boolean => {
  if (!userId) return false;
  return isAdmin(userId);
};
