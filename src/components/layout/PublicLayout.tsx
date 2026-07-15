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

  // Count media items without passing their data through props
  let mediaCount = 0;
  let mediaTypes: ("image" | "video")[] = [];
  try {
    let raw = settings.ad_media;
    if (!raw || raw === "[]") raw = settings.ad_images || "";
    if (raw && raw !== "[]") {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        mediaCount = parsed.length;
        mediaTypes = parsed.map((item: any) =>
          typeof item === "string" ? "image" : item.type || "image"
        );
      }
    }
  } catch { /* empty */ }

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <AdBanner mediaCount={mediaCount} mediaTypes={mediaTypes} tickerText={settings.ticker_text || ""} />
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
