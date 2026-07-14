"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import vi from "./vi.json";
import en from "./en.json";
import zh from "./zh.json";

export type Language = "vi" | "en" | "zh";
type Currency = "VND" | "CNY" | "USD";

const dictionaries: Record<Language, Record<string, string>> = { vi, en, zh };

const languageNames: Record<Language, string> = { vi: "Tiếng Việt", en: "English", zh: "中文" };
const languageFlags: Record<Language, string> = { vi: "🇻🇳", en: "🇬🇧", zh: "🇨🇳" };
const languageCurrencies: Record<Language, Currency> = { vi: "VND", en: "USD", zh: "CNY" };

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  currency: Currency;
  languages: { code: Language; name: string; flag: string; currency: Currency }[];
}

const I18nContext = createContext<I18nContextType | null>(null);

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "vi";
  const stored = localStorage.getItem("lang") as Language | null;
  if (stored && ["vi", "en", "zh"].includes(stored)) return stored;
  const match = document.cookie.match(/lang=([^;]+)/);
  if (match && ["vi", "en", "zh"].includes(match[1])) return match[1] as Language;
  return "vi";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("vi");

  useEffect(() => { setLangState(getInitialLanguage()); }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
    document.cookie = `lang=${newLang};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const dict = dictionaries[lang];
    let text = dict[key] || dictionaries.vi[key] || key;
    if (params) Object.entries(params).forEach(([k, v]) => { text = text.replace(`{{${k}}}`, String(v)); });
    return text;
  }, [lang]);

  const currency = languageCurrencies[lang];

  const languages = Object.entries(languageNames).map(([code, name]) => ({
    code: code as Language, name,
    flag: languageFlags[code as Language],
    currency: languageCurrencies[code as Language],
  }));

  return (
    <I18nContext.Provider value={{ lang, setLang, t, currency, languages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within LanguageProvider");
  return ctx;
}
