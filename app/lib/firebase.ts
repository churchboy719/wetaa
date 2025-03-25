"use client";

import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXPD6LyuFKe_fAxbDlZ3xqRsL4FbbzpIU",
  authDomain: "wetaa-cf39d.firebaseapp.com",
  projectId: "wetaa-cf39d",
  storageBucket: "wetaa-cf39d.firebasestorage.app",
  messagingSenderId: "724351413169",
  appId: "1:724351413169:web:11b7594b6b53c5eb222b90",
  measurementId: "G-EWEH46ZEQS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const NEXT_PUBLIC_FIREBASE_VAPID_KEY = "BJdWUWNgGkppQOM5ryz_XIr0lWDNmwBJ9umZBiLbIjvTJ9YTA-pdw9c6_kLtfHnBQWDSgR8N3BpaEXiwOqoq9zY"
// Initialize Analytics only if supported & running on client
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Initialize Messaging only if running on client
let messaging:any;
if (typeof window !== "undefined") {
  messaging = getMessaging(app);
}


// Check if window is available before accessing navigator
export const registerServiceWorker = async () => {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    try {
      //const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      const registration:any = await registerServiceWorker();
if (!registration) return null;

const token = await getToken(messaging, {
  vapidKey: NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  serviceWorkerRegistration: registration,
  // if (!messaging:any) {
  //   console.error("Firebase Messaging is not initialized.");
  //   return;
  // }
  
});
return token;

      console.log("Service Worker registered:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }
};


// Request Notification Permission & Get Token
export const requestForToken = async (): Promise<string | null> => {
  if (!messaging) return null;

  try {
    const token = await getToken(messaging, {
     // vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
     vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.ready,
    });
    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

// Listen for Incoming Messages
export const onMessageListener = (): Promise<any> =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      console.log("FCM Message Received:", payload);
      resolve(payload);
    });
  });

export { app, analytics, messaging };
