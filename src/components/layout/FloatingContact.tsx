"use client";

import { useState } from "react";
import { MessageCircle, Facebook } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingContactProps {
  zaloLink: string;
  facebookLink: string;
}

export function FloatingContact({ zaloLink, facebookLink }: FloatingContactProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded buttons */}
      <div
        className={cn(
          "flex flex-col gap-3 transition-all duration-300 origin-bottom",
          expanded
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-75 translate-y-4 pointer-events-none"
        )}
      >
        {/* Facebook Button */}
        <a
          href={facebookLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#1877F2] text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          title="Tham gia nhóm Facebook"
        >
          <Facebook size={20} />
          <span className="text-sm font-medium whitespace-nowrap">Nhóm Facebook</span>
        </a>

        {/* Zalo Button */}
        <a
          href={zaloLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#0068FF] text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          title="Liên hệ qua Zalo"
        >
          <MessageCircle size={20} />
          <span className="text-sm font-medium whitespace-nowrap">Chat Zalo</span>
        </a>
      </div>

      {/* Main Toggle Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95",
          expanded
            ? "bg-gray-700 text-white rotate-45"
            : "bg-[#0068FF] text-white"
        )}
        title="Liên hệ"
      >
        <MessageCircle
          size={24}
          className={cn(
            "transition-all",
            expanded ? "rotate-0" : ""
          )}
        />
      </button>
    </div>
  );
}
