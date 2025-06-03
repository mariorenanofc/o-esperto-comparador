
// Lista de User IDs que são administradores
const ADMIN_USER_IDS = [
  'user_2xEwnZzYUslFxGOwIZL7gCL4Qp5', // Primeiro administrador
  'user_2xc4GZtqQRSIf9ak16TsqOWsOfP'  // Segundo administrador
];

export const isAdmin = (userId: string): boolean => {
  return ADMIN_USER_IDS.includes(userId);
};

export const requireAdmin = (userId: string | null): boolean => {
  if (!userId) return false;
  return isAdmin(userId);
};
