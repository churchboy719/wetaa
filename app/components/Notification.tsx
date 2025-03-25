"use client";

import { useEffect, useState } from "react";

import { requestForToken, onMessageListener } from "../lib/firebase";

const Notification = () => {
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    requestForToken();

    onMessageListener()
      .then((payload: any) => {
        setNotification(payload?.notification?.title);
        console.log("New notification:", payload);
      })
      .catch((err:any) => console.log("Failed to receive message", err));
  }, []);

  return (
    <div>
      {notification && <div className="bg-blue-500 text-white p-2">{notification}</div>}
    </div>
  );
};

export default Notification;
