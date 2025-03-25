// Import Firebase scripts
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAXPD6LyuFKe_fAxbDlZ3xqRsL4FbbzpIU",
  authDomain: "wetaa-cf39d.firebaseapp.com",
  projectId: "wetaa-cf39d",
  storageBucket: "wetaa-cf39d.appspot.com",
  messagingSenderId: "724351413169",
  appId: "1:724351413169:web:11b7594b6b53c5eb222b90",
  measurementId: "G-EWEH46ZEQS",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Background Message Handler
messaging.onBackgroundMessage((payload) => {
  console.log("[FCM Service Worker] Background Message received", payload);

  const notificationTitle = payload?.notification?.title || "Notification";
  const notificationOptions = {
    body: payload?.notification?.body || "You have a new message.",
    icon: "/globe.svg", // Ensure this exists in /public
    sound: "/wetaaSound.wav", // Ensure this exists in /public
    data: payload?.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Optional: Notification Click Handler
self.addEventListener("notificationclick", (event) => {
  console.log("[FCM Service Worker] Notification clicked", event.notification);

  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          const client = clientList[0];
          return client.focus();
        }
        return clients.openWindow("/");
      })
  );
});
