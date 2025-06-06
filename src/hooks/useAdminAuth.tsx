
import { useAuth } from "@/hooks/useAuth";

// Lista de User IDs que são administradores
const ADMIN_USER_IDS = [
  '2e83f998-48e4-4b71-ae39-3118b42a3e51',
  'bded2150-509c-4d02-a8fc-2c45977a3b13'
];

export const useAdminAuth = () => {
  const { user, loading } = useAuth();
  
  const isUserAdmin = user ? ADMIN_USER_IDS.includes(user.id) : false;
  
  return {
    isAdmin: isUserAdmin,
    isLoaded: !loading,
    user
  };
};
