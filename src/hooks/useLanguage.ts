"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

export type Language = "en" | "jp";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  toggleLanguage: () => {},
  setLanguage: () => {},
});

/** 언어 컨텍스트에서 현재 언어 상태와 전환 함수를 반환 */
export function useLanguage() {
  return useContext(LanguageContext);
}

/** 언어 상태 관리 훅 - EN/JP 전환 및 로컬스토리지 저장 */
export function useLanguageState() {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("voca-language") as Language;
    if (saved === "en" || saved === "jp") setLanguageState(saved);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("voca-language", lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "jp" : "en");
  }, [language, setLanguage]);

  return { language, toggleLanguage, setLanguage };
}
