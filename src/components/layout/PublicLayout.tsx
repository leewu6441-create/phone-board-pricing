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

  let adImages: string[] = [];
  try {
    const raw = settings.ad_images || "";
    if (raw) adImages = JSON.parse(raw);
  } catch {
    adImages = [];
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <AdBanner images={adImages} tickerText={settings.ticker_text || ""} />
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
