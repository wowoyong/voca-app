"use client";

import { LanguageContext } from "@/hooks/useLanguage";
import { useLanguageState } from "@/hooks/useLanguage";
import BottomNav from "@/components/BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const langState = useLanguageState();

  return (
    <LanguageContext.Provider value={langState}>
      <div className="min-h-dvh pb-16">
        {children}
      </div>
      <BottomNav />
    </LanguageContext.Provider>
  );
}
