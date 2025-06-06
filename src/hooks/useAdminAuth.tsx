
import { useAuth } from "@/hooks/useAuth";

// Lista de User IDs que são administradores - substitua pelos IDs reais
const ADMIN_USER_IDS = [
  'f47ac10b-58cc-4372-a567-0e02b2c3d479', // Substitua pelo ID real do primeiro admin
  '6ba7b810-9dad-11d1-80b4-00c04fd430c8'  // Substitua pelo ID real do segundo admin
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
