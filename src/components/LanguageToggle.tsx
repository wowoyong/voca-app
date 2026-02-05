"use client";

import { useLanguage } from "@/hooks/useLanguage";

/** 학습 언어 전환 토글 버튼 (EN/JP) */
export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="relative inline-flex h-9 w-[72px] items-center rounded-full border bg-secondary transition-colors focus:outline-none shrink-0"
    >
      <span
        className={`absolute flex h-7 w-8 items-center justify-center rounded-full bg-background shadow-sm text-xs font-bold transition-all duration-200 text-foreground ${
          language === "jp" ? "left-[calc(100%-2.25rem)]" : "left-1"
        }`}
      >
        {language === "en" ? "EN" : "JP"}
      </span>
    </button>
  );
}
