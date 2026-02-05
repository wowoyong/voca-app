"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // 이미 설치했거나 거부한 경우 표시하지 않음
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // 이미 설치된 경우 감지
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowPrompt(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-2xl p-4 z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">앱으로 설치하기</h3>
          <p className="text-sm text-white/90 mb-3">
            홈 화면에 추가하여 더 빠르게 접속하세요
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
            >
              설치
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-white/90 hover:text-white transition-colors"
            >
              나중에
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
