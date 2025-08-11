import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { initPushNotifications, setupInAppPushListener } from "@/services/push/pushService";

const PushInitializer: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    setupInAppPushListener();
  }, []);

  useEffect(() => {
    if (user?.id) {
      // Add a small delay to ensure everything is loaded
      setTimeout(() => {
        initPushNotifications(user.id);
      }, 1000);
    }
  }, [user?.id]);

  return null;
};

export default PushInitializer;
