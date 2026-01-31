"use client";

import { useLanguage } from "@/hooks/useLanguage";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="relative inline-flex h-9 w-[72px] items-center rounded-full transition-colors focus:outline-none shrink-0"
      style={{ backgroundColor: language === "en" ? "#6366f1" : "#e879f9" }}
    >
      <span
        className={`absolute flex h-7 w-8 items-center justify-center rounded-full bg-white shadow-md text-xs font-bold transition-all duration-200 ${
          language === "jp" ? "left-[calc(100%-2.25rem)]" : "left-1"
        }`}
      >
        {language === "en" ? "EN" : "JP"}
      </span>
    </button>
  );
}
