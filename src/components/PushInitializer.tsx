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
      initPushNotifications(user.id);
    }
  }, [user?.id]);

  return null;
};

export default PushInitializer;
