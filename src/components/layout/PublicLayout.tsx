import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { FloatingContact } from "./FloatingContact";
import { AdBanner } from "./AdBanner";
import { getAllSettings } from "@/lib/db/settings";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export async function PublicLayout({ children }: PublicLayoutProps) {
  const settings = await getAllSettings();

  let adMedia: { type: "image" | "video"; data: string }[] = [];
  try {
    // Try new format first, fall back to old ad_images key
    let raw = settings.ad_media;
    if (!raw || raw === "[]") {
      raw = settings.ad_images || "";
    }
    if (raw && raw !== "[]") {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        adMedia = parsed.map((item: any) =>
          typeof item === "string" ? { type: "image", data: item } : item
        );
      }
    }
  } catch {
    adMedia = [];
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <AdBanner media={adMedia} tickerText={settings.ticker_text || ""} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <FloatingContact
        facebookLink={settings.facebook_link || "https://facebook.com/groups/your-group"}
        wechatId={settings.wechat_id || ""}
        showWechat={!!(settings.wechat_id || settings.wechat_qrcode)}
      />
    </div>
  );
}
