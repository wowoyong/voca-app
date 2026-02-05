"use client";

import { useEffect, useState } from "react";

/** 푸시 알림 권한 요청 및 구독 관리 컴포넌트 */
export default function PushNotification() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    // Check if Push notifications are supported
    if ("serviceWorker" in navigator && "PushManager" in window && "Notification" in window) {
      setSupported(true);
      setPermission(Notification.permission);

      // Register service worker
      registerServiceWorker();
    }
  }, []);

  // 서비스 워커 등록
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("[Push] Service Worker registered:", registration);
      setRegistered(true);
    } catch (error) {
      console.error("[Push] Service Worker registration failed:", error);
    }
  };

  // 알림 권한 요청 및 푸시 구독 처리
  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === "granted") {
        console.log("[Push] Notification permission granted");
        
        // Subscribe to push notifications
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
          ),
        });

        console.log("[Push] Push subscription:", subscription);

        // TODO: Send subscription to server
        // await fetch("/api/push/subscribe", {
        //   method: "POST",
        //   body: JSON.stringify(subscription),
        // });
      }
    } catch (error) {
      console.error("[Push] Error requesting permission:", error);
    }
  };

  // VAPID 키를 Uint8Array로 변환
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (!supported) {
    return null;
  }

  if (!registered) {
    return null;
  }

  if (permission === "granted") {
    return null;
  }

  if (permission === "denied") {
    return null;
  }

  // Show prompt for "default" permission
  return (
    <div className="fixed bottom-20 left-4 right-4 bg-card border rounded-2xl shadow-xl p-4 z-40 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">학습 알림 받기</h3>
          <p className="text-sm text-muted-foreground mb-3">
            매일 정해진 시간에 학습 알림을 받아보세요
          </p>
          <div className="flex gap-2">
            <button
              onClick={requestPermission}
              className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              허용
            </button>
            <button
              onClick={() => setPermission("denied")}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              나중에
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
