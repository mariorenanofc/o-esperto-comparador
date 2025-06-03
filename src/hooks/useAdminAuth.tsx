
import { useUser } from "@clerk/clerk-react";
import { isAdmin } from "@/lib/admin";

export const useAdminAuth = () => {
  const { user, isLoaded } = useUser();
  
  const isUserAdmin = user ? isAdmin(user.id) : false;
  
  return {
    isAdmin: isUserAdmin,
    isLoaded,
    user
  };
};
