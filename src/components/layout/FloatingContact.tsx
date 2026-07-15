"use client";

import { useState } from "react";
import { MessageCircle, Facebook, QrCode, MessageSquareText, Copy, Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface FloatingContactProps {
  facebookLink: string;
  wechatId: string;
  showWechat: boolean;
}

export function FloatingContact({ facebookLink, wechatId, showWechat }: FloatingContactProps) {
  const [expanded, setExpanded] = useState(false);
  const [zaloQrOpen, setZaloQrOpen] = useState(false);
  const [wechatOpen, setWechatOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const handleCopyWechat = async () => {
    try {
      await navigator.clipboard.writeText(wechatId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = wechatId;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <div
          className={cn(
            "flex flex-col gap-3 transition-all duration-500 origin-bottom",
            expanded
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-75 translate-y-4 pointer-events-none"
          )}
          style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        >
          {/* Zalo QR Code — only contact method for Zalo */}
          <button
            onClick={() => { setZaloQrOpen(true); setExpanded(false); }}
            className="flex items-center gap-2 bg-[#0068FF] text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            title={t("contact.qrCode")}
          >
            <QrCode size={20} />
            <span className="text-sm font-medium whitespace-nowrap">{t("contact.chatZalo")}</span>
          </button>

          {/* WeChat */}
          {showWechat && (
            <button
              onClick={() => { setWechatOpen(true); setExpanded(false); }}
              className="flex items-center gap-2 bg-[#07C160] text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
              title={t("contact.wechat")}
            >
              <MessageSquareText size={20} />
              <span className="text-sm font-medium whitespace-nowrap">{t("contact.wechat")}</span>
            </button>
          )}

          {/* Facebook */}
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

      {/* Zalo QR Code Dialog */}
      <Dialog open={zaloQrOpen} onOpenChange={setZaloQrOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("contact.chatZalo")}</DialogTitle>
            <DialogDescription>{t("contact.scanQr")}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            <img
              src="/api/qrcode?type=zalo"
              alt="Zalo QR Code"
              className="max-w-full h-auto rounded-lg"
              style={{ maxHeight: "300px" }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).parentElement!.innerHTML =
                  '<div class="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">QR code not set up yet</div>';
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* WeChat Dialog */}
      <Dialog open={wechatOpen} onOpenChange={setWechatOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("contact.wechat")}</DialogTitle>
            <DialogDescription>{t("contact.scanQr")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 p-2">
            <img
              src="/api/qrcode?type=wechat"
              alt="WeChat QR Code"
              className="max-w-full h-auto rounded-lg"
              style={{ maxHeight: "280px" }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {wechatId && (
              <div className="text-center space-y-3 w-full">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-500">{t("contact.wechatId")}:</span>
                  <span className="text-lg font-bold text-gray-900 font-mono tracking-wide">{wechatId}</span>
                </div>
                <button
                  onClick={handleCopyWechat}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#07C160] text-white rounded-lg hover:bg-[#06AD56] transition-colors"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  <span>{copied ? t("contact.copied") : t("contact.copyWechat")}</span>
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
