"use client";

import { useState } from "react";
import { MessageCircle, Facebook } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface FloatingContactProps {
  zaloLink: string;
  facebookLink: string;
}

export function FloatingContact({ zaloLink, facebookLink }: FloatingContactProps) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <div
        className={cn(
          "flex flex-col gap-3 transition-all duration-300 origin-bottom",
          expanded
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-75 translate-y-4 pointer-events-none"
        )}
      >
        <a
          href={facebookLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#1877F2] text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          title={t("contact.joinFb")}
        >
          <Facebook size={20} />
          <span className="text-sm font-medium whitespace-nowrap">{t("contact.fbGroup")}</span>
        </a>

        <a
          href={zaloLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#0068FF] text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          title={t("contact.zalo")}
        >
          <MessageCircle size={20} />
          <span className="text-sm font-medium whitespace-nowrap">{t("contact.chatZalo")}</span>
        </a>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95",
          expanded ? "bg-gray-700 text-white rotate-45" : "bg-[#0068FF] text-white"
        )}
        title={t("contact.title")}
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
