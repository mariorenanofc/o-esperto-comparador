
import { useAuth } from "@/hooks/useAuth";

export const useAdminAuth = () => {
  const { user, loading } = useAuth();
  
  // Simple admin check - you can enhance this with a proper admin table
  const isUserAdmin = user?.email === 'admin@example.com'; // Replace with your admin logic
  
  return {
    isAdmin: isUserAdmin,
    isLoaded: !loading,
    user
  };
};
