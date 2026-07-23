"use client";

import { useEffect, useState } from "react";
import { saveSubscription } from "@/app/actions/push";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function PushManager() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return; // Push not supported
    }

    navigator.serviceWorker.register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered with scope:", registration.scope);
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });

    // Check permission status
    if (Notification.permission === "default") {
      const hasDismissed = localStorage.getItem("dismissedPushPrompt");
      if (!hasDismissed) {
        setTimeout(() => setShowPrompt(true), 3000); // Show prompt after 3s
      }
    } else if (Notification.permission === "granted") {
        subscribeToPush();
    }
  }, []);

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicVapidKey) {
            console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not defined");
            return;
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });
      }

      await saveSubscription(JSON.parse(JSON.stringify(subscription)));
      setShowPrompt(false);
    } catch (error) {
      console.error("Error subscribing to push:", error);
    }
  };

  const handleEnable = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await subscribeToPush();
    } else {
      setShowPrompt(false);
      localStorage.setItem("dismissedPushPrompt", "true");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("dismissedPushPrompt", "true");
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <div className="fixed bottom-20 md:bottom-6 right-0 left-0 md:left-auto md:right-6 z-[100] p-4 flex justify-center md:block">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="bg-neutral-900 text-white rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)] max-w-sm w-full border border-neutral-700 relative overflow-hidden flex items-start gap-4"
          >
            <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center shrink-0">
                <Bell size={20} className="text-white" />
            </div>
            <div className="flex-1 pt-0.5">
                <h4 className="font-bold text-sm mb-1">Мэдэгдэл авах уу?</h4>
                <p className="text-xs text-neutral-400 mb-3">Шинэ мессеж болон Match-ийн мэдээллийг цаг алдалгүй аваарай.</p>
                <div className="flex gap-2">
                    <button 
                        onClick={handleEnable}
                        className="bg-white text-neutral-900 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-neutral-200 transition-colors"
                    >
                        Зөвшөөрөх
                    </button>
                    <button 
                        onClick={handleDismiss}
                        className="bg-neutral-800 text-neutral-300 px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-neutral-700 transition-colors"
                    >
                        Дараа
                    </button>
                </div>
            </div>
            <button onClick={handleDismiss} className="absolute top-2 right-2 text-neutral-500 hover:text-white">
                <X size={16} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
