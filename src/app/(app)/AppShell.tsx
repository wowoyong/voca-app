"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LanguageContext } from "@/hooks/useLanguage";
import { useLanguageState } from "@/hooks/useLanguage";
import BottomNav from "@/components/BottomNav";
import AdBanner from "@/components/AdBanner";
import AdInterstitial from "@/components/AdInterstitial";
import InstallPrompt from "@/components/InstallPrompt";
import PushNotification from "@/components/PushNotification";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const langState = useLanguageState();
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.username) setUsername(d.username);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <LanguageContext.Provider value={langState}>
      {/* 전면 광고 (세션당 1회) */}
      <AdInterstitial />
      
      {/* PWA 설치 프롬프트 */}
      <InstallPrompt />
      
      {/* Push uc54cub9bc ud504ub86cud504ud2b8 */}
      <PushNotification />
      
      <div className="min-h-dvh pb-28">
        {/* Top bar */}
        {username && (
          <div className="flex justify-end items-center px-4 h-10 border-b border-border bg-background">
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                {username}
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-card border rounded-lg shadow-lg py-1 min-w-[120px] z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {children}
      </div>
      
      {/* 배너 광고 (하단 고정) */}
      <AdBanner />
      
      {/* 하단 네비게이션 */}
      <BottomNav />
    </LanguageContext.Provider>
  );
}
