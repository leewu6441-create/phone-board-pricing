"use client";

import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang, languages } = useTranslation();

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          title={l.name}
          className={cn(
            "px-1.5 py-0.5 rounded text-sm transition-all",
            lang === l.code
              ? "bg-white/20 scale-110"
              : "opacity-60 hover:opacity-100 hover:bg-white/10"
          )}
        >
          {l.flag}
        </button>
      ))}
    </div>
  );
}
