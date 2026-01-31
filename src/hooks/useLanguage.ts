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

export function useLanguage() {
  return useContext(LanguageContext);
}

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
