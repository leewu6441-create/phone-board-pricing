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

  let mediaCount = 0;
  let mediaTypes: ("image" | "video")[] = [];
  let mediaLinks: string[] = [];
  try {
    let raw = settings.ad_media;
    if (!raw || raw === "[]") raw = settings.ad_images || "";
    if (raw && raw !== "[]") {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        mediaCount = parsed.length;
        mediaTypes = parsed.map((item: any) => (typeof item === "string" ? "image" : item.type || "image"));
        mediaLinks = parsed.map((item: any) => (typeof item === "string" ? "" : item.link || ""));
      }
    }
  } catch { /* empty */ }

  // Get ticker text for all languages - try new keys first, fallback to old
  const tickerVi = settings.ticker_text_vi || settings.ticker_text || "";
  const tickerEn = settings.ticker_text_en || settings.ticker_text || "";
  const tickerZh = settings.ticker_text_zh || settings.ticker_text || "";

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <AdBanner
        mediaCount={mediaCount}
        mediaTypes={mediaTypes}
        mediaLinks={mediaLinks}
        tickerVi={tickerVi}
        tickerEn={tickerEn}
        tickerZh={tickerZh}
      />
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
