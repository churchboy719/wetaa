"use client";

import { useEffect, useState } from "react";
import { requestForToken, onMessageListener } from "../lib/firebase";

const FCMHandler = () => {
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    requestForToken().then((token:any) => {
      console.log("FCM Token:", token);
    });

    onMessageListener().then((payload:any) => {
      console.log("New Notification:", payload);
      setNotification(payload);
    });
  }, []);

  return (
    notification && (
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
        New Message: {notification?.notification?.title}
      </div>
    )
  );
};

export default FCMHandler;
